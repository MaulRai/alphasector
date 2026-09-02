from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.db.database import ChatRepository
from app.core.security import decode_access_token

router = APIRouter(prefix="/chat", tags=["Conversational Research Rooms"])

class CreateSessionRequest(BaseModel):
    title: Optional[str] = "Sesi Riset Baru"
    primary_ticker: Optional[str] = None
    session_id: Optional[str] = None

class UpdateSessionRequest(BaseModel):
    title: Optional[str] = None
    primary_ticker: Optional[str] = None

def get_required_user_id(authorization: Optional[str]) -> int:
    """Helper to extract user_id from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Header Authorization tidak valid atau tidak ada.")
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Token kedaluwarsa atau tidak valid.")
    try:
        return int(payload["sub"])
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="User ID tidak valid dalam token.")

@router.get("/sessions")
async def get_sessions(authorization: Optional[str] = Header(None)):
    """Retrieve all conversational research sessions owned by the current user."""
    user_id = get_required_user_id(authorization)
    sessions = ChatRepository.get_user_sessions(user_id=user_id)
    return {"sessions": sessions}

@router.post("/sessions")
async def create_session(req: CreateSessionRequest, authorization: Optional[str] = Header(None)):
    """Create a new conversational research room."""
    user_id = get_required_user_id(authorization)
    session = ChatRepository.create_session(
        user_id=user_id,
        title=req.title or "Sesi Riset Baru",
        primary_ticker=req.primary_ticker,
        session_id=req.session_id
    )
    return {"session": session}

@router.get("/sessions/{session_id}")
async def get_session_details(session_id: str, authorization: Optional[str] = Header(None)):
    """Retrieve session details and full multi-turn message history."""
    user_id = get_required_user_id(authorization)
    session = ChatRepository.get_session(session_id=session_id, user_id=user_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sesi riset tidak ditemukan atau bukan milik akun Anda.")
        
    messages = ChatRepository.get_session_messages(session_id=session_id, user_id=user_id)
    return {
        "session": session,
        "messages": messages
    }

@router.patch("/sessions/{session_id}")
async def update_session(session_id: str, req: UpdateSessionRequest, authorization: Optional[str] = Header(None)):
    """Rename session title or change primary ticker."""
    user_id = get_required_user_id(authorization)
    updated = ChatRepository.update_session(
        session_id=session_id,
        user_id=user_id,
        title=req.title,
        primary_ticker=req.primary_ticker
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Sesi riset tidak ditemukan.")
    return {"status": "success"}

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, authorization: Optional[str] = Header(None)):
    """Delete a research session and all its messages."""
    user_id = get_required_user_id(authorization)
    deleted = ChatRepository.delete_session(session_id=session_id, user_id=user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Sesi riset tidak ditemukan.")
    return {"status": "success"}
