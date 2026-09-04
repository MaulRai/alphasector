from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List, Dict, Any
from app.schemas.agent import AgentQueryRequest, AgentQueryResponse
from app.agent.orchestrator import agent_orchestrator
from app.db.database import ResearchReportRepository, ChatRepository, UserRepository, AILogRepository
from app.core.security import decode_access_token
from app.core.cloudinary_service import cloudinary_service
from app.core.config import settings

router = APIRouter(prefix="/agent", tags=["AI Agent"])

def get_optional_user_id(authorization: Optional[str]) -> Optional[int]:
    """Helper to extract user_id if Bearer token is provided."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    try:
        return int(payload["sub"])
    except (ValueError, TypeError):
        return None

@router.post("/query", response_model=AgentQueryResponse)
async def execute_agent_query(
    request: AgentQueryRequest,
    authorization: Optional[str] = Header(None),
    x_sectors_api_key: Optional[str] = Header(None)
):
    """
    Execute autonomous multi-step reasoning query across Sectors Financial API.
    Supports Bring Your Own Key (BYOK) or uses free 50-credit demo server quota.
    Logs comprehensive telemetry, models, context, sectors calls, and outputs to DB.
    """
    user_id = get_optional_user_id(authorization)
    active_session_id = request.session_id
    img_data_url = None
    custom_key: Optional[str] = x_sectors_api_key.strip() if x_sectors_api_key else None

    try:
        # 1. Process Image Upload early (Cloudinary CDN URL or base64 data URI)
        if request.image_base64:
            mime = request.image_mime_type or "image/png"
            cloudinary_url = await cloudinary_service.upload_base64_image(
                base64_data=request.image_base64,
                mime_type=mime
            )
            img_data_url = cloudinary_url or f"data:{mime};base64,{request.image_base64}"

        # 2. Determine effective Sectors API Key & Credit Quota
        if user_id:
            user_dict = UserRepository.get_by_id(user_id)
            if not custom_key and user_dict and user_dict.get("custom_sectors_key"):
                custom_key = user_dict["custom_sectors_key"].strip()
            
            # If still using server demo key, verify demo credits
            if not custom_key:
                credits = user_dict.get("demo_credits", 50) if user_dict else 50
                if credits is not None and credits <= 0:
                    raise HTTPException(
                        status_code=402,
                        detail="KUOTA_HABIS: Kuota 50 credit demo server Anda telah habis. Silakan pasang Sectors API Key pribadi Anda di menu Settings (⚙️) untuk melanjutkan riset."
                    )
                # Deduct 1 credit for server lookup
                UserRepository.deduct_demo_credits(user_id, 1)

        # 3. Ensure Chat Session Exists
        if user_id and active_session_id:
            session = ChatRepository.get_session(active_session_id, user_id)
            if not session:
                session_title = request.query[:45] + ("..." if len(request.query) > 45 else "")
                ChatRepository.create_session(
                    user_id=user_id,
                    title=session_title,
                    primary_ticker=request.context_ticker,
                    session_id=active_session_id
                )
        elif user_id and not active_session_id:
            session_title = request.query[:45] + ("..." if len(request.query) > 45 else "")
            new_session = ChatRepository.create_session(
                user_id=user_id,
                title=session_title,
                primary_ticker=request.context_ticker
            )
            active_session_id = new_session["id"]

        # 4. Save User Message
        if user_id and active_session_id:
            ChatRepository.add_message(
                session_id=active_session_id,
                user_id=user_id,
                role="user",
                content=request.query,
                image_url=img_data_url
            )

        # 5. Retrieve recent conversation history for multi-turn context (last 6 messages)
        conversation_history = []
        if user_id and active_session_id:
            try:
                raw_msgs = ChatRepository.get_session_messages(active_session_id, user_id)
                conversation_history = [
                    {"role": m["role"], "content": m["content"]}
                    for m in raw_msgs[:-1]
                    if m.get("content")
                ][-6:]
            except Exception as hist_err:
                print(f"[Warning] Failed to fetch session history: {hist_err}")

        # 6. Execute agent with custom or default key
        response = await agent_orchestrator.execute(
            query=request.query,
            context_ticker=request.context_ticker,
            session_id=active_session_id,
            custom_api_key=custom_key,
            conversation_history=conversation_history,
            image_base64=request.image_base64,
            image_mime_type=request.image_mime_type
        )

        # 7. Persist assistant message and update session primary ticker
        if user_id and active_session_id:
            try:
                ChatRepository.add_message(
                    session_id=active_session_id,
                    user_id=user_id,
                    role="assistant",
                    content=response.synthesis.executive_summary,
                    report_data=response.model_dump()
                )
                if response.primary_ticker:
                    ChatRepository.update_session(
                        session_id=active_session_id,
                        user_id=user_id,
                        primary_ticker=response.primary_ticker
                    )
            except Exception as chat_err:
                print(f"[Warning] Failed to save chat message: {chat_err}")

        # 8. Archival into ResearchReportRepository
        if user_id:
            try:
                ResearchReportRepository.create(
                    user_id=user_id,
                    query=request.query,
                    intent=str(response.intent),
                    primary_ticker=response.primary_ticker,
                    comparison_tickers=response.comparison_tickers,
                    report_data=response.model_dump(),
                    total_execution_time_ms=response.total_execution_time_ms,
                    credits_consumed=response.credits_consumed
                )
            except Exception as save_err:
                print(f"[Warning] Failed to persist report for user {user_id}: {save_err}")

        # 9. Comprehensive AI Interaction Observability & Telemetry Logging
        try:
            sectors_tool_calls = [
                step.tool_call.model_dump()
                for step in response.reasoning_trace
                if getattr(step, "tool_call", None) is not None
            ]
            context_data = {
                "context_ticker": request.context_ticker,
                "detected_primary_ticker": response.primary_ticker,
                "has_image": bool(request.image_base64),
                "image_mime_type": request.image_mime_type if request.image_base64 else None,
                "history_turn_count": len(conversation_history),
                "visual_context_summary": response.visual_context,
                "custom_sectors_key_used": bool(custom_key),
            }
            estimated_cost = {
                "credits_consumed": response.credits_consumed,
                "sectors_tool_calls_count": len(sectors_tool_calls),
                "primary_model": settings.GROQ_MODEL,
                "vision_model": "gemini-2.5-flash" if request.image_base64 else None,
                "execution_time_ms": response.total_execution_time_ms,
                "pricing_mode": "byok_custom_key" if custom_key else "demo_server_quota",
            }
            AILogRepository.log_interaction(
                user_id=user_id,
                session_id=active_session_id,
                query=request.query,
                model_name=settings.GROQ_MODEL,
                vision_model="gemini-2.5-flash" if request.image_base64 else None,
                image_url=img_data_url,
                intent=str(response.intent),
                primary_ticker=response.primary_ticker,
                comparison_tickers=response.comparison_tickers,
                context_data=context_data,
                sectors_tool_calls=sectors_tool_calls,
                credits_consumed=response.credits_consumed,
                execution_time_ms=response.total_execution_time_ms,
                estimated_cost=estimated_cost,
                output_summary=response.synthesis.executive_summary,
                output_data=response.model_dump(),
                reasoning_trace=[s.model_dump() for s in response.reasoning_trace]
            )
        except Exception as log_err:
            print(f"[Warning] Failed to record AI interaction log: {log_err}")

        return response

    except HTTPException:
        # Re-raise explicit HTTPExceptions (e.g. 402 quota exceeded)
        raise
    except Exception as e:
        # Forensic Error Logging for behavior investigation
        try:
            AILogRepository.log_interaction(
                user_id=user_id,
                session_id=active_session_id,
                query=request.query,
                model_name=settings.GROQ_MODEL,
                vision_model="gemini-2.5-flash" if request.image_base64 else None,
                image_url=img_data_url,
                context_data={
                    "context_ticker": request.context_ticker,
                    "has_image": bool(request.image_base64),
                    "custom_sectors_key_used": bool(custom_key),
                },
                error_message=str(e)
            )
        except Exception as log_err:
            print(f"[Warning] Failed to log error interaction to DB: {log_err}")
        raise HTTPException(status_code=500, detail=f"Agent Execution Error: {str(e)}")

@router.get("/logs")
async def get_ai_interaction_logs(
    session_id: Optional[str] = None,
    limit: int = 50,
    authorization: Optional[str] = Header(None)
):
    """
    Retrieve comprehensive AI interaction audit logs.
    Supports filtering by session_id, user_id (via Bearer token), or latest overall interactions.
    """
    user_id = get_optional_user_id(authorization)
    logs = AILogRepository.get_logs(
        limit=min(limit, 100),
        session_id=session_id,
        user_id=user_id
    )
    return {"total": len(logs), "logs": logs}


@router.get("/history")
async def get_user_research_history(
    authorization: Optional[str] = Header(None),
    limit: int = 20
):
    """Retrieve list of past research reports owned by the authenticated user."""
    user_id = get_optional_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Autentikasi diperlukan untuk mengakses riwayat riset.")
        
    history = ResearchReportRepository.get_user_history(user_id=user_id, limit=limit)
    return {"history": history}

@router.get("/history/{report_id}")
async def get_user_report_by_id(
    report_id: int,
    authorization: Optional[str] = Header(None)
):
    """Retrieve full details of a specific research report owned by the authenticated user."""
    user_id = get_optional_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Autentikasi diperlukan untuk mengakses laporan riset.")
        
    report = ResearchReportRepository.get_by_id(report_id=report_id, user_id=user_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan riset tidak ditemukan atau bukan milik akun Anda.")
        
    return report
