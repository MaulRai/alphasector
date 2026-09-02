from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List, Dict, Any
from app.schemas.agent import AgentQueryRequest, AgentQueryResponse
from app.agent.orchestrator import agent_orchestrator
from app.db.database import ResearchReportRepository, ChatRepository
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
    authorization: Optional[str] = Header(None)
):
    """
    Execute autonomous multi-step reasoning query across Sectors Financial API.
    Returns live step-by-step reasoning trace, quantitative metrics, AI synthesis, and suggested follow-ups.
    Persists to both chat_sessions/chat_messages and research_reports for the authenticated user.
    """
    try:
        user_id = get_optional_user_id(authorization)
        active_session_id = request.session_id

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
            ChatRepository.add_message(
                session_id=active_session_id,
                user_id=user_id,
                role="user",
                content=request.query
            )

        # Execute agent
        response = await agent_orchestrator.execute(
            query=request.query,
            context_ticker=request.context_ticker,
            session_id=active_session_id
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
