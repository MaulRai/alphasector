import os
import time
from typing import Dict, List, Optional, Any, Union
import httpx
from app.core.config import settings
from app.sectors.cache import cache

class SectorsAPIClient:
    """Async HTTP Client for Sectors Financial API v2 with caching & error handling."""
    
    def __init__(self, api_key: Optional[str] = None, timeout: float = 25.0):
        self.api_key = api_key or settings.SECTORS_API_KEY
        self.base_url = settings.SECTORS_BASE_URL
        self.timeout = timeout
        
        if not self.api_key:
            raise ValueError("SECTORS_API_KEY is not configured.")

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": self.api_key,
            "Content-Type": "application/json",
            "User-Agent": "AlphaSector-Engine/1.0"
        }

    async def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None, use_cache: bool = False, cache_ttl: int = 600) -> Any:
        cache_key = f"{endpoint}:{str(params)}"
        if use_cache:
            cached = cache.get(cache_key)
            if cached is not None:
                return cached, 0, 200

        url = f"{self.base_url}{endpoint}"
        start_time = time.time()
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(url, headers=self._headers(), params=params)
            elapsed_ms = int((time.time() - start_time) * 1000)
            
            if response.status_code >= 400 and response.status_code != 404:
                # Still try to extract json error
                try:
                    err_json = response.json()
                    detail = err_json.get("message") or err_json.get("error") or response.text
                except Exception:
                    detail = response.text
                raise httpx.HTTPStatusError(f"Sectors API Error {response.status_code}: {detail}", request=response.request, response=response)
                
            try:
                data = response.json()
            except Exception:
                data = response.text

            if use_cache and response.status_code in (200, 404):
                cache.set(cache_key, data, ttl_seconds=cache_ttl)

            return data, elapsed_ms, response.status_code

    # --- IDX ENDPOINTS ---

    async def get_subsectors(self) -> Any:
        data, ms, status = await self._get("/subsectors/", use_cache=True, cache_ttl=3600)
        return data, ms, status

    async def screen_companies(
        self,
        where: Optional[str] = None,
        order_by: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        q: Optional[str] = None
    ) -> Any:
        params: Dict[str, Any] = {}
        if q:
            params["q"] = q
        else:
            if where: params["where"] = where
            if order_by: params["order_by"] = order_by
            params["limit"] = limit
            params["offset"] = offset

        return await self._get("/companies/", params=params)

    async def get_company_report(self, symbol: str, sections: str = "overview,valuation,financials,peers") -> Any:
        clean_symbol = symbol.upper().replace(".JK", "")
        params = {"sections": sections}
        return await self._get(f"/company/report/{clean_symbol}/", params=params, use_cache=True, cache_ttl=300)

    async def get_company_segments(self, symbol: str, year: Optional[int] = None) -> Any:
        clean_symbol = symbol.upper().replace(".JK", "")
        params = {"year": year} if year else {}
        return await self._get(f"/company/segments/{clean_symbol}/", params=params, use_cache=True, cache_ttl=600)

    async def get_broker_registry(self) -> Any:
        return await self._get("/brokers/", use_cache=True, cache_ttl=3600)

    async def get_top_brokers(self, cohort: str = "all", metric: str = "gross") -> Any:
        params = {"cohort": cohort, "metric": metric}
        return await self._get("/brokers/top/", params=params, use_cache=True, cache_ttl=300)

    async def get_broker_summary_top(self, symbol: str) -> Any:
        clean_symbol = symbol.upper().replace(".JK", "")
        return await self._get(f"/broker-summary/{clean_symbol}/top/", use_cache=True, cache_ttl=300)

    async def get_foreign_flow(self, symbol: str) -> Any:
        clean_symbol = symbol.upper().replace(".JK", "")
        return await self._get(f"/broker-summary/foreign-flow/{clean_symbol}/", use_cache=True, cache_ttl=300)

    async def get_top_movers(self, periods: str = "7d", n_stock: int = 5) -> Any:
        params = {"periods": periods, "n_stock": n_stock}
        return await self._get("/companies/top-changes/", params=params, use_cache=True, cache_ttl=300)

    # --- SGX / KLSE / MINING ---

    async def get_sgx_companies(self) -> Any:
        return await self._get("/sgx/companies/", use_cache=True, cache_ttl=600)

    async def get_sgx_top(self) -> Any:
        return await self._get("/sgx/companies/top/", use_cache=True, cache_ttl=600)

    async def get_mining_commodities(self) -> Any:
        return await self._get("/mining/commodities/", use_cache=True, cache_ttl=3600)

    async def get_mining_sites(self) -> Any:
        return await self._get("/mining/sites/", use_cache=True, cache_ttl=600)

sectors_client = SectorsAPIClient()
