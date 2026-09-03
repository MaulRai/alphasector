from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List, Dict, Any
from app.schemas.agent import AgentQueryRequest, AgentQueryResponse
from app.agent.orchestrator import agent_orchestrator
from app.db.database import ResearchReportRepository, ChatRepository, UserRepository
from app.core.security import decode_access_token

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
    """
    try:
        user_id = get_optional_user_id(authorization)
        active_session_id = request.session_id

        # Determine effective Sectors API Key & Credit Quota
        custom_key: Optional[str] = x_sectors_api_key.strip() if x_sectors_api_key else None
        
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

        # If user is authenticated and session_id provided, ensure session exists
        if user_id and active_session_id:
            session = ChatRepository.get_session(active_session_id, user_id)
            if not session:
                # Create session with given ID
                session_title = request.query[:45] + ("..." if len(request.query) > 45 else "")
                ChatRepository.create_session(
                    user_id=user_id,
                    title=session_title,
                    primary_ticker=request.context_ticker,
                    session_id=active_session_id
                )
        elif user_id and not active_session_id:
            # Auto-create new session
            session_title = request.query[:45] + ("..." if len(request.query) > 45 else "")
            new_session = ChatRepository.create_session(
                user_id=user_id,
                title=session_title,
                primary_ticker=request.context_ticker
            )
            active_session_id = new_session["id"]

        # If authenticated, save user message
        if user_id and active_session_id:
            # Construct data URL if image attached
            img_data_url = None
            if request.image_base64:
                mime = request.image_mime_type or "image/png"
                img_data_url = f"data:{mime};base64,{request.image_base64}"
            
            ChatRepository.add_message(
                session_id=active_session_id,
                user_id=user_id,
                role="user",
                content=request.query,
                image_url=img_data_url
            )

        # Retrieve recent conversation history for multi-turn context (last 6 messages)
        conversation_history = []
        if user_id and active_session_id:
            try:
                raw_msgs = ChatRepository.get_session_messages(active_session_id, user_id)
                # Keep messages prior to the current user message
                conversation_history = [
                    {"role": m["role"], "content": m["content"]}
                    for m in raw_msgs[:-1]
                    if m.get("content")
                ][-6:]
            except Exception as hist_err:
                print(f"[Warning] Failed to fetch session history: {hist_err}")

        # Execute agent with custom or default key
        response = await agent_orchestrator.execute(
            query=request.query,
            context_ticker=request.context_ticker,
            session_id=active_session_id,
            custom_api_key=custom_key,
            conversation_history=conversation_history,
            image_base64=request.image_base64,
            image_mime_type=request.image_mime_type
        )

        # If authenticated, persist assistant message and update session primary ticker if identified
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

        # Also persist to ResearchReportRepository for history archival
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
                
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent Execution Error: {str(e)}")

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
