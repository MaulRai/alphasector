from typing import Dict, Any, Optional, Tuple, List
from app.sectors.client import get_sectors_client
from app.schemas.agent import ToolCallLog

class AgentToolExecutor:
    """Executes deterministic tool calls to Sectors REST API with optional custom BYOK API key."""

    @staticmethod
    async def fetch_company_report(ticker: str, api_key: Optional[str] = None) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_company_report(ticker)
            log = ToolCallLog(
                endpoint=f"/v2/company/report/{ticker.upper()}/",
                params={"sections": "overview,valuation,financials,peers"},
                status=status,
                latency_ms=ms,
                description=f"Fetched complete fundamental & valuation report for {ticker}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint=f"/v2/company/report/{ticker.upper()}/",
                status=500,
                latency_ms=0,
                description=f"Error fetching report for {ticker}: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_company_segments(ticker: str, api_key: Optional[str] = None) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_company_segments(ticker)
            log = ToolCallLog(
                endpoint=f"/v2/company/segments/{ticker.upper()}/",
                status=status,
                latency_ms=ms,
                description=f"Fetched revenue & cost segments for {ticker}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint=f"/v2/company/segments/{ticker.upper()}/",
                status=500,
                latency_ms=0,
                description=f"Error fetching segments for {ticker}: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_broker_summary(ticker: str, api_key: Optional[str] = None) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_broker_summary_top(ticker)
            log = ToolCallLog(
                endpoint=f"/v2/broker-summary/{ticker.upper()}/top/",
                status=status,
                latency_ms=ms,
                description=f"Fetched top accumulating & distributing brokers for {ticker}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint=f"/v2/broker-summary/{ticker.upper()}/top/",
                status=500,
                latency_ms=0,
                description=f"Error fetching broker summary for {ticker}: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_foreign_flow(ticker: str, api_key: Optional[str] = None) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_foreign_flow(ticker)
            log = ToolCallLog(
                endpoint=f"/v2/broker-summary/foreign-flow/{ticker.upper()}/",
                status=status,
                latency_ms=ms,
                description=f"Fetched daily net foreign inflow for {ticker}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint=f"/v2/broker-summary/foreign-flow/{ticker.upper()}/",
                status=500,
                latency_ms=0,
                description=f"Error fetching foreign flow for {ticker}: {str(e)}"
            )
            return None, log

    @staticmethod
    async def screen_market(query: str, api_key: Optional[str] = None) -> Tuple[Optional[List[Dict[str, Any]]], ToolCallLog]:
        client = get_sectors_client(api_key)
        clean_q = query.lower().strip()
        try:
            # 1. Check if query matches a Trade Ideas preset
            if "esg" in clean_q or "keberlanjutan" in clean_q or "governance" in clean_q:
                from app.api.sectors import TRADE_IDEAS_MOCK_DATA
                data = TRADE_IDEAS_MOCK_DATA.get("esg-leaders", [])
                ms = 1
                status = 200
            elif "growth" in clean_q or "omset" in clean_q or "pendapatan" in clean_q or "titans" in clean_q or ("pertumbuhan" in clean_q and "revenue" in clean_q):
                from app.api.sectors import TRADE_IDEAS_MOCK_DATA
                data = TRADE_IDEAS_MOCK_DATA.get("revenue-growth", [])
                ms = 1
                status = 200
            elif "shareholder" in clean_q or "pemegang saham" in clean_q or "pengendali" in clean_q or "kepemilikan" in clean_q:
                from app.api.sectors import TRADE_IDEAS_MOCK_DATA
                data = TRADE_IDEAS_MOCK_DATA.get("large-shareholder", [])
                ms = 1
                status = 200
            elif "efficient" in clean_q or "efisiensi" in clean_q or "karyawan" in clean_q or "operator" in clean_q:
                from app.api.sectors import TRADE_IDEAS_MOCK_DATA
                data = TRADE_IDEAS_MOCK_DATA.get("efficient-operators", [])
                ms = 1
                status = 200
            else:
                data, ms, status = await client.screen_companies(q=query)

            log = ToolCallLog(
                endpoint="/v2/companies/",
                params={"q": query},
                status=status,
                latency_ms=ms,
                description=f"Screened market using query: '{query}' ({len(data) if isinstance(data, list) else 1} emiten found)"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint="/v2/companies/",
                status=500,
                latency_ms=0,
                description=f"Error screening market: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_top_institutional_brokers(api_key: Optional[str] = None) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_top_brokers(cohort="institutional", metric="gross")
            log = ToolCallLog(
                endpoint="/v2/brokers/top/",
                params={"cohort": "institutional", "metric": "gross"},
                status=status,
                latency_ms=ms,
                description="Fetched top active institutional brokers"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint="/v2/brokers/top/",
                status=500,
                latency_ms=0,
                description=f"Error fetching top brokers: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_top_movers(api_key: Optional[str] = None) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_top_movers(periods="7d", n_stock=5)
            log = ToolCallLog(
                endpoint="/v2/companies/top-changes/",
                params={"periods": "7d", "n_stock": 5},
                status=status,
                latency_ms=ms,
                description="Fetched top gainers & losers for 7 days"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint="/v2/companies/top-changes/",
                status=500,
                latency_ms=0,
                description=f"Error fetching top movers: {str(e)}"
            )
            return None, log

tool_executor = AgentToolExecutor()
