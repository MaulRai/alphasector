from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.db.database import WatchlistRepository
from app.core.security import decode_access_token

router = APIRouter(prefix="/watchlist", tags=["User Watchlist"])

class WatchlistAddRequest(BaseModel):
    ticker: str
    notes: Optional[str] = None

def get_required_user_id(authorization: Optional[str]) -> int:
    """Helper to extract required user_id from Bearer token."""
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

@router.get("")
async def get_watchlist(authorization: Optional[str] = Header(None)):
    """Get all watchlisted tickers owned by the current user."""
    user_id = get_required_user_id(authorization)
    items = WatchlistRepository.get_user_watchlist(user_id)
    return {"watchlist": items}

@router.post("")
async def add_to_watchlist(req: WatchlistAddRequest, authorization: Optional[str] = Header(None)):
    """Add or update a ticker in the user's personal watchlist."""
    user_id = get_required_user_id(authorization)
    item = WatchlistRepository.add(user_id, req.ticker, req.notes)
    return {"status": "success", "item": item}

@router.delete("/{ticker}")
async def remove_from_watchlist(ticker: str, authorization: Optional[str] = Header(None)):
    """Remove a ticker from the user's personal watchlist."""
    user_id = get_required_user_id(authorization)
    deleted = WatchlistRepository.remove(user_id, ticker)
    return {"status": "success", "deleted": deleted}
