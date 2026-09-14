from typing import Dict, Any, Optional, Tuple, List
from app.sectors.client import get_sectors_client
from app.sectors.mcp_client import get_sectors_mcp_client
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
        try:
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

    @staticmethod
    async def fetch_insider_filings(symbol: Optional[str] = None, limit: int = 10, api_key: Optional[str] = None) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        mcp = get_sectors_mcp_client(api_key)
        try:
            data, ms, status = await mcp.fetch_filings(symbol=symbol, limit=limit)
            log = ToolCallLog(
                endpoint="/v2/filings/",
                params={"symbol": symbol, "limit": limit},
                status=status,
                latency_ms=ms,
                description=f"Fetched insider filings for {symbol or 'market'}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint="/v2/filings/",
                status=500,
                latency_ms=0,
                description=f"Error fetching insider filings: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_shareholders_composition(symbol: str, api_key: Optional[str] = None) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        mcp = get_sectors_mcp_client(api_key)
        try:
            data, ms, status = await mcp.fetch_shareholders_composition(symbol=symbol)
            log = ToolCallLog(
                endpoint=f"/v2/company/shareholders/{symbol.upper()}/",
                params={"symbol": symbol},
                status=status,
                latency_ms=ms,
                description=f"Fetched institutional shareholder decomposition for {symbol}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint=f"/v2/company/shareholders/{symbol.upper()}/",
                status=500,
                latency_ms=0,
                description=f"Error fetching shareholders composition: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_mining_performance(ticker: str, api_key: Optional[str] = None) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        mcp = get_sectors_mcp_client(api_key)
        try:
            data, ms, status = await mcp.fetch_mining_performance(ticker_or_slug=ticker)
            log = ToolCallLog(
                endpoint=f"/v2/mining/performance/{ticker.upper()}/",
                params={"ticker": ticker},
                status=status,
                latency_ms=ms,
                description=f"Fetched mining strip ratio & JORC reserves for {ticker}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint=f"/v2/mining/performance/{ticker.upper()}/",
                status=500,
                latency_ms=0,
                description=f"Error fetching mining performance: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_suspensions(symbol: Optional[str] = None, limit: int = 20, api_key: Optional[str] = None) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        mcp = get_sectors_mcp_client(api_key)
        try:
            data, ms, status = await mcp.fetch_suspensions(symbol=symbol, limit=limit)
            log = ToolCallLog(
                endpoint="/v2/suspensions/",
                params={"symbol": symbol, "limit": limit},
                status=status,
                latency_ms=ms,
                description=f"Fetched BEI suspensions & UMA radar for {symbol or 'market'}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint="/v2/suspensions/",
                status=500,
                latency_ms=0,
                description=f"Error fetching suspensions: {str(e)}"
            )
    @staticmethod
    async def fetch_market_news(
        symbols: Optional[str] = None, 
        tags: Optional[str] = None, 
        limit: int = 10, 
        api_key: Optional[str] = None
    ) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        client = get_sectors_client(api_key)
        try:
            res = await client.get_news(symbols=symbols, tags=tags, limit=limit)
            data = res.get("data")
            log = ToolCallLog(
                endpoint="/v2/news/",
                params={"symbols": symbols, "tags": tags, "limit": limit},
                status=200,
                latency_ms=res.get("latency_ms", 0),
                description=f"Fetched latest market news & sentiment for {symbols or 'market universe'}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint="/v2/news/",
                status=500,
                latency_ms=0,
                description=f"Error fetching market news: {str(e)}"
            )
            return None, log

tool_executor = AgentToolExecutor()

