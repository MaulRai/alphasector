import httpx
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)

class NotionService:
    """Service to create and synchronize Institutional Investment Memos into Notion Workspaces."""

    NOTION_API_URL = "https://api.notion.com/v1/pages"
    NOTION_VERSION = "2022-06-28"

    @classmethod
    def _text_block(cls, content: str, bold: bool = False, italic: bool = False, color: str = "default") -> Dict[str, Any]:
        return {
            "type": "text",
            "text": {"content": content},
            "annotations": {
                "bold": bold,
                "italic": italic,
                "strikethrough": False,
                "underline": False,
                "code": False,
                "color": color
            }
        }

    @classmethod
    def _heading_2(cls, text: str) -> Dict[str, Any]:
        return {
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [cls._text_block(text, bold=True)]
            }
        }

    @classmethod
    def _heading_3(cls, text: str) -> Dict[str, Any]:
        return {
            "object": "block",
            "type": "heading_3",
            "heading_3": {
                "rich_text": [cls._text_block(text, bold=True)]
            }
        }

    @classmethod
    def _bullet_item(cls, title: str, value: str) -> Dict[str, Any]:
        return {
            "object": "block",
            "type": "bulleted_list_item",
            "bulleted_list_item": {
                "rich_text": [
                    cls._text_block(f"{title}: ", bold=True),
                    cls._text_block(value)
                ]
            }
        }

    @classmethod
    def _callout(cls, text: str, emoji: str = "💡", color: str = "blue_background") -> Dict[str, Any]:
        return {
            "object": "block",
            "type": "callout",
            "callout": {
                "rich_text": [cls._text_block(text)],
                "icon": {"type": "emoji", "emoji": emoji},
                "color": color
            }
        }

    @classmethod
    def _divider(cls) -> Dict[str, Any]:
        return {"object": "block", "type": "divider", "divider": {}}

    @classmethod
    def _quote(cls, text: str) -> Dict[str, Any]:
        return {
            "object": "block",
            "type": "quote",
            "quote": {
                "rich_text": [cls._text_block(text, italic=True)]
            }
        }

    @classmethod
    def build_memo_blocks(
        cls,
        ticker: str,
        company_name: str,
        synthesis: Optional[Dict[str, Any]] = None,
        metrics: Optional[Dict[str, Any]] = None,
        piotroski: Optional[Dict[str, Any]] = None,
        pe_band: Optional[Dict[str, Any]] = None,
        broker_summary: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Construct a structured, Wall-Street grade investment memo block tree."""
        blocks: List[Dict[str, Any]] = []

        now_str = datetime.now().strftime("%d %B %Y, %H:%M WIB")

        # 1. Executive Callout: Recommendation & Key Verdict
        verdict = "INVESTMENT MEMO"
        thesis_text = "Analisis fundamental terverifikasi berbasis data resmi Sectors Financial API."
        if synthesis:
            verdict = synthesis.get("valuation_verdict") or synthesis.get("executive_summary", "")[:80] or verdict
            thesis_text = synthesis.get("executive_summary") or synthesis.get("core_thesis") or thesis_text

        blocks.append(cls._callout(
            f"AlphaAgent Investment Verdict: {verdict.upper()}\n\n{thesis_text}",
            emoji="🏛️",
            color="emerald_background" if "BULL" in verdict.upper() or "BELI" in verdict.upper() else "blue_background"
        ))
        blocks.append(cls._divider())

        # 2. Deterministic Financial Intelligence (Piotroski & PE Band)
        blocks.append(cls._heading_2("🧮 Deterministic Financial Engine (Piotroski & P/E Band)"))

        # Piotroski F-Score breakdown
        p_score = piotroski.get("score") if piotroski else metrics.get("piotroski", {}).get("score") if metrics else None
        p_rating = piotroski.get("rating") if piotroski else metrics.get("piotroski", {}).get("rating", "N/A") if metrics else "N/A"
        if p_score is not None:
            blocks.append(cls._bullet_item(
                "Piotroski F-Score (0-9)",
                f"{p_score}/9 — Kondisi Fundamental: {p_rating} (Dihitung dari Profitability, Solvency, & Operating Efficiency)"
            ))

        # PE Historical Band
        band_data = pe_band or (metrics.get("pe_band") if metrics else None)
        if band_data and band_data.get("status"):
            status = band_data.get("status")
            disc = band_data.get("discount_pct")
            mean_pe = band_data.get("mean_pe")
            curr_pe = band_data.get("current_pe")
            disc_str = f" ({'+' if disc and disc > 0 else ''}{disc}% vs Mean {mean_pe:.1f}x)" if disc is not None and mean_pe is not None else ""
            blocks.append(cls._bullet_item(
                "P/E Historical Band Status",
                f"{status}{disc_str} | Current P/E: {curr_pe or '-'}x"
            ))

        # 3. Key Financial Ratios & Multiples
        if metrics:
            blocks.append(cls._heading_2("📊 Key Valuation & Financial Multiples"))
            mcap = metrics.get("market_cap")
            if mcap:
                blocks.append(cls._bullet_item("Market Cap", f"Rp {Number_to_trillion(mcap)}"))
            if metrics.get("pe"):
                blocks.append(cls._bullet_item("P/E Ratio", f"{metrics['pe']}x"))
            if metrics.get("pbv") or metrics.get("pb"):
                blocks.append(cls._bullet_item("PBV Ratio", f"{metrics.get('pbv') or metrics.get('pb')}x"))
            if metrics.get("roe"):
                blocks.append(cls._bullet_item("ROE", f"{metrics['roe']}%"))
            if metrics.get("npm") or metrics.get("net_profit_margin"):
                blocks.append(cls._bullet_item("Net Profit Margin", f"{metrics.get('npm') or metrics.get('net_profit_margin')}%"))
            if metrics.get("der"):
                blocks.append(cls._bullet_item("Debt-to-Equity (DER)", f"{metrics['der']}x"))

        # 4. Key Findings & Catalysts (from LLM Synthesis)
        if synthesis and synthesis.get("key_findings"):
            blocks.append(cls._heading_2("🎯 Key Investment Catalysts"))
            for item in synthesis.get("key_findings", []):
                blocks.append(cls._bullet_item("Katalis", str(item)))

        # 5. Risks & Monitor Items
        if synthesis and synthesis.get("risks"):
            blocks.append(cls._heading_2("⚠️ Investment Risks & Monitoring"))
            for item in synthesis.get("risks", []):
                blocks.append(cls._bullet_item("Risiko", str(item)))

        # 6. Smart Money / Institutional Flow
        if broker_summary:
            blocks.append(cls._heading_2("🏦 Smart Money & Institutional Flow"))
            sentiment = broker_summary.get("sentiment", "NEUTRAL")
            conc = broker_summary.get("buyer_concentration", 0)
            blocks.append(cls._bullet_item("Broker Flow Sentiment", f"{sentiment} (Buyer Concentration: {conc}%)"))

        # 7. Disclaimer & Timestamp
        blocks.append(cls._divider())
        blocks.append(cls._quote(
            f"AlphaAgent Research Engine • Digenerate otomatis pada {now_str} berbasis data resmi Sectors Financial API. "
            f"Dokumen ini bersifat informasi & analisis riset pasar modal, bukan rekomendasi investasi langsung."
        ))

        return blocks

    @classmethod
    async def sync_memo_to_notion(
        cls,
        ticker: str,
        company_name: str,
        synthesis: Optional[Dict[str, Any]] = None,
        metrics: Optional[Dict[str, Any]] = None,
        piotroski: Optional[Dict[str, Any]] = None,
        pe_band: Optional[Dict[str, Any]] = None,
        broker_summary: Optional[Dict[str, Any]] = None,
        custom_notion_api_key: Optional[str] = None,
        custom_parent_page_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a new Page in Notion under parent_page_id with complete investment memo blocks.
        Falls back to instant simulated memo preview if API keys are not supplied.
        """
        api_key = (custom_notion_api_key or settings.NOTION_API_KEY or "").strip()
        parent_id = (custom_parent_page_id or settings.NOTION_PARENT_PAGE_ID or "").strip().replace("-", "")

        blocks = cls.build_memo_blocks(
            ticker=ticker,
            company_name=company_name,
            synthesis=synthesis,
            metrics=metrics,
            piotroski=piotroski,
            pe_band=pe_band,
            broker_summary=broker_summary
        )

        # If no Notion API key or Parent Page ID is provided, return a demo simulated success response
        if not api_key or not parent_id:
            mock_url = f"https://notion.so/alphaagent-investment-memo-{ticker.lower()}-preview"
            logger.info(f"Notion credentials not set. Returning demo mock URL: {mock_url}")
            return {
                "success": True,
                "notion_url": mock_url,
                "page_id": f"demo-{ticker.lower()}",
                "is_mock": True,
                "message": "Demo Mode: Berhasil menghasilkan struktur memo Notion. Pasang NOTION_API_KEY & NOTION_PARENT_PAGE_ID di .env untuk integrasi ke workspace riil."
            }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Notion-Version": cls.NOTION_VERSION,
            "Content-Type": "application/json"
        }

        date_str = datetime.now().strftime("%d/%m/%Y")
        payload = {
            "parent": {"page_id": parent_id},
            "properties": {
                "title": {
                    "title": [
                        {"type": "text", "text": {"content": f"[AlphaAgent] {ticker} - {company_name} ({date_str})"}}
                    ]
                }
            },
            "icon": {"type": "emoji", "emoji": "📈"},
            "children": blocks[:99] # Notion limit is 100 blocks per request
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.post(cls.NOTION_API_URL, headers=headers, json=payload)
                if response.status_code in (200, 201):
                    res_data = response.json()
                    page_url = res_data.get("url", f"https://notion.so/{res_data.get('id', '')}")
                    return {
                        "success": True,
                        "notion_url": page_url,
                        "page_id": res_data.get("id"),
                        "is_mock": False,
                        "message": "Investment Memo berhasil disinkronisasikan ke Notion!"
                    }
                else:
                    error_msg = response.text
                    logger.error(f"Notion API error ({response.status_code}): {error_msg}")
                    return {
                        "success": False,
                        "notion_url": None,
                        "error": f"Notion API Error ({response.status_code}): {error_msg}",
                        "message": "Gagal sinkronisasi ke Notion. Pastikan Token Integration dan Page ID memiliki akses."
                    }
            except Exception as e:
                logger.exception("Failed to connect to Notion API")
                return {
                    "success": False,
                    "notion_url": None,
                    "error": str(e),
                    "message": f"Koneksi ke Notion gagal: {str(e)}"
                }

def Number_to_trillion(val: Any) -> str:
    try:
        n = float(val)
        return f"{n / 1e12:.1f} T"
    except Exception:
        return str(val)
