from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.notion_service import NotionService

router = APIRouter()

class NotionExportRequest(BaseModel):
    ticker: str
    company_name: Optional[str] = None
    synthesis: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, Any]] = None
    piotroski: Optional[Dict[str, Any]] = None
    pe_band: Optional[Dict[str, Any]] = None
    broker_summary: Optional[Dict[str, Any]] = None
    custom_notion_api_key: Optional[str] = None
    custom_parent_page_id: Optional[str] = None

class NotionExportResponse(BaseModel):
    success: bool
    notion_url: Optional[str] = None
    page_id: Optional[str] = None
    is_mock: bool = False
    message: str
    error: Optional[str] = None

@router.post("/notion", response_model=NotionExportResponse)
async def export_memo_to_notion(payload: NotionExportRequest):
    """
    Export institutional investment memo with deterministic metrics (Piotroski, P/E Band)
    and AI synthesis directly to Notion Workspace.
    """
    ticker = payload.ticker.strip().upper().replace(".JK", "")
    company_name = payload.company_name or f"{ticker} Tbk"

    result = await NotionService.sync_memo_to_notion(
        ticker=ticker,
        company_name=company_name,
        synthesis=payload.synthesis,
        metrics=payload.metrics,
        piotroski=payload.piotroski,
        pe_band=payload.pe_band,
        broker_summary=payload.broker_summary,
        custom_notion_api_key=payload.custom_notion_api_key,
        custom_parent_page_id=payload.custom_parent_page_id,
    )

    if not result.get("success") and not result.get("is_mock"):
        return NotionExportResponse(
            success=False,
            error=result.get("error"),
            message=result.get("message", "Gagal mengekspor memo ke Notion.")
        )

    return NotionExportResponse(
        success=True,
        notion_url=result.get("notion_url"),
        page_id=result.get("page_id"),
        is_mock=result.get("is_mock", False),
        message=result.get("message", "Memo berhasil diekspor ke Notion!")
    )
