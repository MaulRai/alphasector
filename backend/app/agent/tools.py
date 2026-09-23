from typing import Dict, Any, Optional, Tuple, List
import logging
from app.sectors.client import get_sectors_client
from app.sectors.mcp_client import get_sectors_mcp_client
from app.schemas.agent import ToolCallLog

logger = logging.getLogger("agent.tools")

class AgentToolExecutor:
    """
    Executes deterministic tool calls using Dual-Protocol Engine:
    - REST: Direct connection to Sectors v2 REST API (<150ms raw speed).
    - MCP: Anthropic/Sectors Model Context Protocol JSON-RPC 2.0 with auto-fallback to REST.
    """

    @staticmethod
    async def fetch_company_report(
        ticker: str, 
        api_key: Optional[str] = None, 
        protocol_mode: str = "rest"
    ) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        clean_sym = ticker.upper().replace(".JK", "")
        
        if protocol_mode.lower() == "mcp":
            mcp = get_sectors_mcp_client(api_key)
            try:
                data, ms, status = await mcp.fetch_company_report(clean_sym, sections=["overview", "valuation", "financials", "peers"])
                if status == 200 and data and isinstance(data, dict):
                    log = ToolCallLog(
                        endpoint=f"[MCP JSON-RPC] fetch-company-report/{clean_sym}",
                        params={"symbol": clean_sym, "protocol": "MCP"},
                        status=status,
                        latency_ms=ms,
                        description=f"[MCP] Fetched complete fundamental & valuation report for {clean_sym}"
                    )
                    return data, log
                logger.warning(f"MCP fetch_company_report returned status {status}, falling back to REST")
            except Exception as e:
                logger.warning(f"MCP fetch_company_report exception: {e}, falling back to REST")

        # REST or Fallback
        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_company_report(clean_sym)
            desc_prefix = "[MCP Fallback -> REST] " if protocol_mode.lower() == "mcp" else ""
            log = ToolCallLog(
                endpoint=f"/v2/company/report/{clean_sym}/",
                params={"sections": "overview,valuation,financials,peers"},
                status=status,
                latency_ms=ms,
                description=f"{desc_prefix}Fetched complete fundamental & valuation report for {clean_sym}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint=f"/v2/company/report/{clean_sym}/",
                status=500,
                latency_ms=0,
                description=f"Error fetching report for {clean_sym}: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_company_segments(
        ticker: str, 
        api_key: Optional[str] = None,
        protocol_mode: str = "rest"
    ) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        clean_sym = ticker.upper().replace(".JK", "")

        if protocol_mode.lower() == "mcp":
            mcp = get_sectors_mcp_client(api_key)
            try:
                data, ms, status = await mcp.fetch_company_segments(clean_sym)
                if status == 200 and data:
                    log = ToolCallLog(
                        endpoint=f"[MCP JSON-RPC] fetch-company-segments/{clean_sym}",
                        params={"symbol": clean_sym},
                        status=status,
                        latency_ms=ms,
                        description=f"[MCP] Fetched revenue & cost segments for {clean_sym}"
                    )
                    return data, log
            except Exception as e:
                logger.warning(f"MCP fetch_company_segments exception: {e}, falling back to REST")

        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_company_segments(clean_sym)
            desc_prefix = "[MCP Fallback -> REST] " if protocol_mode.lower() == "mcp" else ""
            log = ToolCallLog(
                endpoint=f"/v2/company/segments/{clean_sym}/",
                status=status,
                latency_ms=ms,
                description=f"{desc_prefix}Fetched revenue & cost segments for {clean_sym}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint=f"/v2/company/segments/{clean_sym}/",
                status=500,
                latency_ms=0,
                description=f"Error fetching segments for {clean_sym}: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_broker_summary(
        ticker: str, 
        api_key: Optional[str] = None,
        protocol_mode: str = "rest"
    ) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        clean_sym = ticker.upper().replace(".JK", "")

        if protocol_mode.lower() == "mcp":
            mcp = get_sectors_mcp_client(api_key)
            try:
                data, ms, status = await mcp.fetch_broker_summary_top(clean_sym)
                if status == 200 and data and isinstance(data, dict):
                    log = ToolCallLog(
                        endpoint=f"[MCP JSON-RPC] fetch-broker-summary-top/{clean_sym}",
                        params={"symbol": clean_sym},
                        status=status,
                        latency_ms=ms,
                        description=f"[MCP] Fetched top accumulating & distributing brokers for {clean_sym}"
                    )
                    return data, log
            except Exception as e:
                logger.warning(f"MCP fetch_broker_summary exception: {e}, falling back to REST")

        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_broker_summary_top(clean_sym)
            desc_prefix = "[MCP Fallback -> REST] " if protocol_mode.lower() == "mcp" else ""
            log = ToolCallLog(
                endpoint=f"/v2/broker-summary/{clean_sym}/top/",
                status=status,
                latency_ms=ms,
                description=f"{desc_prefix}Fetched top accumulating & distributing brokers for {clean_sym}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint=f"/v2/broker-summary/{clean_sym}/top/",
                status=500,
                latency_ms=0,
                description=f"Error fetching broker summary for {clean_sym}: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_foreign_flow(
        ticker: str, 
        api_key: Optional[str] = None,
        protocol_mode: str = "rest"
    ) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        clean_sym = ticker.upper().replace(".JK", "")

        if protocol_mode.lower() == "mcp":
            mcp = get_sectors_mcp_client(api_key)
            try:
                data, ms, status = await mcp.fetch_foreign_flow(clean_sym)
                if status == 200 and data:
                    log = ToolCallLog(
                        endpoint=f"[MCP JSON-RPC] fetch-foreign-flow/{clean_sym}",
                        params={"symbol": clean_sym},
                        status=status,
                        latency_ms=ms,
                        description=f"[MCP] Fetched daily net foreign inflow for {clean_sym}"
                    )
                    return data, log
            except Exception as e:
                logger.warning(f"MCP fetch_foreign_flow exception: {e}, falling back to REST")

        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_foreign_flow(clean_sym)
            desc_prefix = "[MCP Fallback -> REST] " if protocol_mode.lower() == "mcp" else ""
            log = ToolCallLog(
                endpoint=f"/v2/broker-summary/foreign-flow/{clean_sym}/",
                status=status,
                latency_ms=ms,
                description=f"{desc_prefix}Fetched daily net foreign inflow for {clean_sym}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint=f"/v2/broker-summary/foreign-flow/{clean_sym}/",
                status=500,
                latency_ms=0,
                description=f"Error fetching foreign flow for {clean_sym}: {str(e)}"
            )
            return None, log

    @staticmethod
    async def screen_market(
        query: str, 
        api_key: Optional[str] = None,
        protocol_mode: str = "rest"
    ) -> Tuple[Optional[List[Dict[str, Any]]], ToolCallLog]:
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
    async def fetch_top_institutional_brokers(
        api_key: Optional[str] = None,
        protocol_mode: str = "rest"
    ) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
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
    async def fetch_top_movers(
        api_key: Optional[str] = None,
        protocol_mode: str = "rest"
    ) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_top_changes()
            log = ToolCallLog(
                endpoint="/v2/companies/top-changes/",
                params={},
                status=status,
                latency_ms=ms,
                description="Fetched top gainers and losers leaderboard"
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
    async def fetch_insider_filings(
        symbol: Optional[str] = None,
        transaction_type: Optional[str] = None,
        limit: int = 20,
        api_key: Optional[str] = None,
        protocol_mode: str = "rest"
    ) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        clean_sym = symbol.upper().replace(".JK", "") if symbol else None

        if protocol_mode.lower() == "mcp":
            mcp = get_sectors_mcp_client(api_key)
            try:
                data, ms, status = await mcp.fetch_filings(symbol=clean_sym, transaction_type=transaction_type, limit=limit)
                if status == 200 and data:
                    log = ToolCallLog(
                        endpoint=f"[MCP JSON-RPC] fetch-filings/{clean_sym or 'MARKET'}",
                        params={"symbol": clean_sym, "limit": limit},
                        status=status,
                        latency_ms=ms,
                        description=f"[MCP] Fetched insider filings for {clean_sym or 'IDX Market'}"
                    )
                    return data, log
            except Exception as e:
                logger.warning(f"MCP fetch_insider_filings exception: {e}, falling back to REST")

        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_insider_filings(symbol=clean_sym, limit=limit)
            desc_prefix = "[MCP Fallback -> REST] " if protocol_mode.lower() == "mcp" else ""
            log = ToolCallLog(
                endpoint="/v2/filings/",
                params={"symbol": clean_sym, "limit": limit},
                status=status,
                latency_ms=ms,
                description=f"{desc_prefix}Fetched insider filings for {clean_sym or 'IDX Market'}"
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
    async def fetch_shareholders_composition(
        ticker: str,
        year: Optional[int] = None,
        api_key: Optional[str] = None,
        protocol_mode: str = "rest"
    ) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        clean_sym = ticker.upper().replace(".JK", "")

        if protocol_mode.lower() == "mcp":
            mcp = get_sectors_mcp_client(api_key)
            try:
                data, ms, status = await mcp.fetch_shareholders_composition(clean_sym, year)
                if status == 200 and data:
                    log = ToolCallLog(
                        endpoint=f"[MCP JSON-RPC] fetch-shareholders-composition/{clean_sym}",
                        params={"symbol": clean_sym, "year": year},
                        status=status,
                        latency_ms=ms,
                        description=f"[MCP] Fetched institutional KSEI composition for {clean_sym}"
                    )
                    return data, log
            except Exception as e:
                logger.warning(f"MCP fetch_shareholders_composition exception: {e}, falling back to REST")

        client = get_sectors_client(api_key)
        try:
            data, ms, status = await client.get_shareholders_composition(clean_sym, year)
            desc_prefix = "[MCP Fallback -> REST] " if protocol_mode.lower() == "mcp" else ""
            log = ToolCallLog(
                endpoint=f"/v2/companies/shareholders/{clean_sym}/",
                params={"year": year},
                status=status,
                latency_ms=ms,
                description=f"{desc_prefix}Fetched institutional KSEI composition for {clean_sym}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint=f"/v2/companies/shareholders/{clean_sym}/",
                status=500,
                latency_ms=0,
                description=f"Error fetching shareholders composition: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_mining_performance(
        ticker: str, 
        api_key: Optional[str] = None,
        protocol_mode: str = "rest"
    ) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        mcp = get_sectors_mcp_client(api_key)
        try:
            data, ms, status = await mcp.fetch_mining_performance(ticker_or_slug=ticker)
            log = ToolCallLog(
                endpoint=f"[MCP JSON-RPC] fetch-mining-company-performance/{ticker.upper()}",
                params={"ticker": ticker},
                status=status,
                latency_ms=ms,
                description=f"[MCP] Fetched mining strip ratio & JORC reserves for {ticker}"
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
    async def fetch_suspensions(
        symbol: Optional[str] = None, 
        limit: int = 20, 
        api_key: Optional[str] = None,
        protocol_mode: str = "rest"
    ) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        mcp = get_sectors_mcp_client(api_key)
        try:
            data, ms, status = await mcp.fetch_suspensions(symbol=symbol, limit=limit)
            log = ToolCallLog(
                endpoint="[MCP JSON-RPC] fetch-suspensions",
                params={"symbol": symbol, "limit": limit},
                status=status,
                latency_ms=ms,
                description=f"[MCP] Fetched BEI suspensions & UMA radar for {symbol or 'market'}"
            )
            return data, log
        except Exception as e:
            log = ToolCallLog(
                endpoint="/v2/suspensions/",
                status=500,
                latency_ms=0,
                description=f"Error fetching suspensions: {str(e)}"
            )
            return None, log

    @staticmethod
    async def fetch_market_news(
        symbols: Optional[str] = None, 
        tags: Optional[str] = None, 
        limit: int = 10, 
        api_key: Optional[str] = None,
        protocol_mode: str = "rest"
    ) -> Tuple[Optional[Dict[str, Any]], ToolCallLog]:
        if protocol_mode.lower() == "mcp":
            mcp = get_sectors_mcp_client(api_key)
            try:
                data, ms, status = await mcp.fetch_news(symbols=symbols, tags=tags, limit=limit)
                if status == 200 and data:
                    log = ToolCallLog(
                        endpoint="[MCP JSON-RPC] fetch-news",
                        params={"symbols": symbols, "tags": tags, "limit": limit},
                        status=status,
                        latency_ms=ms,
                        description=f"[MCP] Fetched latest market news & sentiment for {symbols or 'market universe'}"
                    )
                    return data, log
            except Exception as e:
                logger.warning(f"MCP fetch_news exception: {e}, falling back to REST")

        client = get_sectors_client(api_key)
        try:
            res = await client.get_news(symbols=symbols, tags=tags, limit=limit)
            data = res.get("data")
            desc_prefix = "[MCP Fallback -> REST] " if protocol_mode.lower() == "mcp" else ""
            log = ToolCallLog(
                endpoint="/v2/news/",
                params={"symbols": symbols, "tags": tags, "limit": limit},
                status=200,
                latency_ms=res.get("latency_ms", 0),
                description=f"{desc_prefix}Fetched latest market news & sentiment for {symbols or 'market universe'}"
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
