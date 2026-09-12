import os
import json
import time
import logging
from typing import Dict, List, Optional, Any, Tuple
import httpx
from app.core.config import settings
from app.sectors.cache import cache

logger = logging.getLogger(__name__)

# Known ticker to mining slug mapping for instant zero-latency lookup
TICKER_TO_MINING_SLUG = {
    "ADRO": "pt-alamtri-resources-indonesia-tbk",
    "ADRO.JK": "pt-alamtri-resources-indonesia-tbk",
    "AADI": "pt-adaro-andalan-indonesia-tbk",
    "AADI.JK": "pt-adaro-andalan-indonesia-tbk",
    "PTBA": "pt-bukit-asam-tbk",
    "PTBA.JK": "pt-bukit-asam-tbk",
    "BUMI": "pt-bumi-resources-tbk",
    "BUMI.JK": "pt-bumi-resources-tbk",
    "ANTM": "pt-aneka-tambang-tbk",
    "ANTM.JK": "pt-aneka-tambang-tbk",
    "INCO": "pt-vale-indonesia-tbk",
    "INCO.JK": "pt-vale-indonesia-tbk",
    "MDKA": "pt-merdeka-copper-gold-tbk",
    "MDKA.JK": "pt-merdeka-copper-gold-tbk",
    "HRUM": "pt-harum-energy-tbk",
    "HRUM.JK": "pt-harum-energy-tbk",
    "ITMG": "pt-indo-tambangraya-megah-tbk",
    "ITMG.JK": "pt-indo-tambangraya-megah-tbk",
    "MBMA": "pt-merdeka-battery-materials-tbk",
    "MBMA.JK": "pt-merdeka-battery-materials-tbk",
    "NCKL": "pt-trimegah-bangun-persada-tbk",
    "NCKL.JK": "pt-trimegah-bangun-persada-tbk",
    "TINS": "pt-timah-tbk",
    "TINS.JK": "pt-timah-tbk",
    "MEDC": "pt-medco-energi-internasional-tbk",
    "MEDC.JK": "pt-medco-energi-internasional-tbk",
    "INDY": "pt-indika-energy-tbk",
    "INDY.JK": "pt-indika-energy-tbk",
    "TOBA": "pt-toba-bara-sejahtera-tbk",
    "TOBA.JK": "pt-toba-bara-sejahtera-tbk",
    "BRMS": "pt-bumi-resources-minerals-tbk",
    "BRMS.JK": "pt-bumi-resources-minerals-tbk",
    "DSSA": "pt-dian-swastatika-sentosa-tbk",
    "DSSA.JK": "pt-dian-swastatika-sentosa-tbk",
    "CUAN": "pt-petrindo-jaya-kreasi-tbk",
    "CUAN.JK": "pt-petrindo-jaya-kreasi-tbk",
    "PSAB": "pt-j-resources-asia-pasifik-tbk",
    "PSAB.JK": "pt-j-resources-asia-pasifik-tbk",
    "GEMS": "pt-golden-energy-mines-tbk",
    "GEMS.JK": "pt-golden-energy-mines-tbk",
    "KKGI": "pt-resource-alam-indonesia-tbk",
    "KKGI.JK": "pt-resource-alam-indonesia-tbk",
    "MYOH": "pt-samindo-resources-tbk",
    "MYOH.JK": "pt-samindo-resources-tbk",
}

class SectorsMCPClient:
    """Async Client for Sectors Model Context Protocol (MCP) Streamable HTTP Server."""

    def __init__(self, api_key: Optional[str] = None, timeout: float = 30.0):
        raw_key = api_key or settings.SECTORS_API_KEY
        self.api_key = raw_key.strip()
        self.mcp_url = "https://sectors-mcp.supertype.ai/mcp"
        self.timeout = timeout
        self._request_counter = 1

    def _headers(self) -> Dict[str, str]:
        auth_header = f"Bearer {self.api_key}" if not self.api_key.startswith("Bearer ") else self.api_key
        return {
            "Authorization": auth_header,
            "Accept": "application/json, text/event-stream",
            "Content-Type": "application/json",
            "User-Agent": "AlphaSector-MCP-Engine/1.0",
        }

    async def call_tool(
        self,
        tool_name: str,
        arguments: Optional[Dict[str, Any]] = None,
        use_cache: bool = True,
        cache_ttl: Optional[int] = None
    ) -> Tuple[Optional[Any], int, int]:
        """
        Execute an MCP tool call via JSON-RPC 2.0 with SSE Streamable HTTP response parsing.
        Returns: (parsed_data, latency_ms, status_code)
        """
        params = arguments or {}
        effective_ttl = cache_ttl if cache_ttl is not None else settings.SECTORS_CACHE_TTL_SECONDS
        cache_key = f"mcp:{tool_name}:{json.dumps(params, sort_keys=True)}"

        if use_cache:
            cached = cache.get(cache_key)
            if cached is not None:
                return cached, 0, 200

        self._request_counter += 1
        payload = {
            "jsonrpc": "2.0",
            "id": self._request_counter,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": params
            }
        }

        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.mcp_url,
                    headers=self._headers(),
                    json=payload
                )
                elapsed_ms = int((time.time() - start_time) * 1000)

                if response.status_code != 200:
                    logger.warning(f"MCP Tool {tool_name} returned status {response.status_code}: {response.text[:200]}")
                    return None, elapsed_ms, response.status_code

                # Parse SSE format: 'event: message\ndata: {"result": ...}'
                parsed_data = None
                for line in response.text.splitlines():
                    line_str = line.strip()
                    if line_str.startswith("data:"):
                        json_str = line_str[5:].strip()
                        rpc_resp = json.loads(json_str)
                        if "error" in rpc_resp:
                            logger.error(f"MCP RPC error for {tool_name}: {rpc_resp['error']}")
                            return None, elapsed_ms, 500

                        result = rpc_resp.get("result", {})
                        if result.get("isError"):
                            err_content = result.get("content", [{}])[0].get("text", "Unknown MCP error")
                            logger.warning(f"MCP Tool error: {err_content}")
                            return None, elapsed_ms, 400

                        content_items = result.get("content", [])
                        if content_items and content_items[0].get("type") == "text":
                            raw_text = content_items[0].get("text", "{}")
                            try:
                                parsed_data = json.loads(raw_text)
                            except Exception:
                                parsed_data = raw_text

                if use_cache and parsed_data is not None:
                    cache.set(cache_key, parsed_data, ttl_seconds=effective_ttl)

                return parsed_data, elapsed_ms, 200

        except Exception as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.exception(f"Exception calling MCP tool {tool_name}: {e}")
            return None, elapsed_ms, 500

    # -------------------------------------------------------------------------
    # FORENSIC & INSIDER TOOLS
    # -------------------------------------------------------------------------

    async def fetch_filings(
        self,
        symbol: Optional[str] = None,
        transaction_type: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Tuple[Optional[Any], int, int]:
        """Fetch insider transactions filed by Directors, Commissioners, and Controllers."""
        args: Dict[str, Any] = {"limit": limit, "offset": offset}
        if symbol:
            clean_sym = symbol.upper().replace(".JK", "")
            args["symbol"] = clean_sym
        if transaction_type:
            args["transaction_type"] = transaction_type
        return await self.call_tool("fetch-filings", args)

    async def fetch_shareholders_composition(
        self,
        symbol: str,
        year: Optional[int] = None
    ) -> Tuple[Optional[Any], int, int]:
        """Fetch monthly breakdown of Pension Funds, Mutual Funds, Insurance, Corporate, Retail Local vs Foreign."""
        clean_sym = symbol.upper().replace(".JK", "")
        args: Dict[str, Any] = {"symbol": clean_sym}
        if year:
            args["year"] = year
        return await self.call_tool("fetch-shareholders-composition", args)

    async def fetch_suspensions(
        self,
        symbol: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Tuple[Optional[Any], int, int]:
        """Fetch BEI suspension radar and UMA notices with official exchange PDF announcement letters."""
        args: Dict[str, Any] = {"limit": limit, "offset": offset}
        if symbol:
            clean_sym = symbol.upper().replace(".JK", "")
            args["symbol"] = clean_sym
        return await self.call_tool("fetch-suspensions", args)

    # -------------------------------------------------------------------------
    # MINING & COMMODITIES SUITE
    # -------------------------------------------------------------------------

    async def resolve_mining_slug(self, ticker_or_slug: str) -> Optional[str]:
        """Resolve ticker symbol (e.g. 'ADRO', 'PTBA') to official ESDM mining slug."""
        clean = ticker_or_slug.upper().replace(".JK", "")
        if clean in TICKER_TO_MINING_SLUG:
            return TICKER_TO_MINING_SLUG[clean]

        # If already looks like a slug
        if "-" in ticker_or_slug.lower():
            return ticker_or_slug.lower()

        # Dynamic fallback search via fetch-mining-companies
        data, _, status = await self.call_tool("fetch-mining-companies", {"keyword": clean, "limit": 5})
        if data and isinstance(data, dict):
            for item in data.get("results", []):
                sym = item.get("symbol", "").upper().replace(".JK", "")
                if sym == clean:
                    slug = item.get("slug")
                    TICKER_TO_MINING_SLUG[clean] = slug
                    return slug
            # If no exact symbol match, take the first result slug if available
            results = data.get("results", [])
            if results:
                slug = results[0].get("slug")
                TICKER_TO_MINING_SLUG[clean] = slug
                return slug

        return None

    async def fetch_mining_performance(
        self,
        ticker_or_slug: str,
        year: Optional[int] = None,
        commodity_type: Optional[str] = None
    ) -> Tuple[Optional[Any], int, int]:
        """Fetch strip ratio, JORC/KCMI proven & probable reserves, resources, and production capacity."""
        slug = await self.resolve_mining_slug(ticker_or_slug)
        if not slug:
            return None, 0, 404
        args: Dict[str, Any] = {"slug": slug}
        if year:
            args["year"] = year
        if commodity_type:
            args["commodity_type"] = commodity_type
        return await self.call_tool("fetch-mining-company-performance", args)

    async def fetch_mining_ownership(self, ticker_or_slug: str) -> Tuple[Optional[Any], int, int]:
        """Fetch mining conglomerate holding ownership structure."""
        slug = await self.resolve_mining_slug(ticker_or_slug)
        if not slug:
            return None, 0, 404
        return await self.call_tool("fetch-mining-company-ownership", {"slug": slug})

    async def fetch_mining_licenses(
        self,
        company: Optional[str] = None,
        commodity_type: Optional[str] = None,
        province: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Tuple[Optional[Any], int, int]:
        """Fetch official ESDM Ditjen Minerba IUP/WIUP licenses, expiry dates, and concession areas."""
        args: Dict[str, Any] = {"limit": limit, "offset": offset}
        if company:
            args["company"] = company
        if commodity_type:
            args["commodity_type"] = commodity_type
        if province:
            args["province"] = province
        return await self.call_tool("fetch-mining-licenses", args)

    async def fetch_mining_commodity_price(
        self,
        commodity_name: str,
        start_year: int = 2020,
        end_year: int = 2025
    ) -> Tuple[Optional[Any], int, int]:
        """Fetch historical Coal, Nickel, Gold, or Copper benchmark prices."""
        args = {
            "commodity_name": commodity_name,
            "start_year": start_year,
            "end_year": end_year
        }
        return await self.call_tool("fetch-mining-commodity-price", args)

    async def fetch_mining_license_auctions(
        self,
        status: Optional[str] = None,
        limit: int = 20
    ) -> Tuple[Optional[Any], int, int]:
        """Fetch open WIUP/IUP mining license auctions."""
        args: Dict[str, Any] = {"limit": limit}
        if status:
            args["status"] = status
        return await self.call_tool("fetch-mining-license-auctions", args)


sectors_mcp_client = SectorsMCPClient()

def get_sectors_mcp_client(api_key: Optional[str] = None) -> SectorsMCPClient:
    """Return SectorsMCPClient with custom user key if provided, else shared singleton."""
    if api_key and api_key.strip():
        return SectorsMCPClient(api_key=api_key.strip())
    return sectors_mcp_client
