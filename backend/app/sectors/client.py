import os
import time
from datetime import datetime, time as dt_time, timezone, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
import httpx
from app.core.config import settings
from app.sectors.cache import cache

WIB_TZ = timezone(timedelta(hours=7))

def is_idx_market_hours() -> Tuple[bool, str]:
    """
    Check if current time is within IDX trading window (08:30 – 16:30 WIB, Senin–Jumat).
    Returns (is_market_hours, human_readable_status).
    """
    now_wib = datetime.now(WIB_TZ)
    weekday = now_wib.weekday()
    current_t = now_wib.time()
    
    day_names = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
    day_str = day_names[weekday]
    time_str = now_wib.strftime("%H:%M WIB")
    
    if weekday >= 5:
        return False, f"Bursa Tutup (Akhir Pekan - {day_str}, {time_str}). Jam update aktif: 08:30 - 16:30 WIB."
        
    start_t = dt_time(8, 30)
    end_t = dt_time(16, 30)
    
    if current_t < start_t:
        return False, f"Bursa Belum Buka ({day_str}, {time_str}). Jam update aktif: 08:30 - 16:30 WIB."
    elif current_t > end_t:
        return False, f"Bursa Sudah Tutup ({day_str}, {time_str}). Jam update aktif: 08:30 - 16:30 WIB."
        
    return True, f"Bursa Aktif ({day_str}, {time_str}). Sinkronisasi 2 jam diizinkan."

class SectorsAPIClient:
    """Async HTTP Client for Sectors Financial API v2 with persistent two-tier caching & error handling."""
    
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

    async def _get(
        self, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None, 
        use_cache: bool = True, 
        cache_ttl: Optional[int] = None
    ) -> Any:
        effective_ttl = cache_ttl if cache_ttl is not None else settings.SECTORS_CACHE_TTL_SECONDS
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
                try:
                    err_json = response.json()
                    detail = err_json.get("message") or err_json.get("error") or response.text
                except Exception:
                    detail = response.text
                raise httpx.HTTPStatusError(
                    f"Sectors API Error {response.status_code}: {detail}",
                    request=response.request,
                    response=response
                )
                
            try:
                data = response.json()
            except Exception:
                data = response.text

            if use_cache and response.status_code in (200, 404):
                cache.set(cache_key, data, ttl_seconds=effective_ttl)

            return data, elapsed_ms, response.status_code

    # --- IDX ENDPOINTS (ALL CACHED BY DEFAULT) ---

    async def get_subsectors(self) -> Any:
        return await self._get("/subsectors/", use_cache=True)

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

        return await self._get("/companies/", params=params, use_cache=True)

    async def get_company_report(self, symbol: str, sections: str = "overview,valuation,financials,peers") -> Any:
        clean_symbol = symbol.upper().replace(".JK", "")
        params = {"sections": sections}
        return await self._get(f"/company/report/{clean_symbol}/", params=params, use_cache=True)

    async def get_company_segments(self, symbol: str, year: Optional[int] = None) -> Any:
        clean_symbol = symbol.upper().replace(".JK", "")
        params = {"year": year} if year else {}
        return await self._get(f"/company/segments/{clean_symbol}/", params=params, use_cache=True)

    async def get_broker_registry(self) -> Any:
        return await self._get("/brokers/", use_cache=True)

    async def get_top_brokers(self, cohort: str = "all", metric: str = "gross") -> Any:
        params = {"cohort": cohort, "metric": metric}
        return await self._get("/brokers/top/", params=params, use_cache=True)

    async def get_broker_summary_top(self, symbol: str) -> Any:
        clean_symbol = symbol.upper().replace(".JK", "")
        return await self._get(f"/broker-summary/{clean_symbol}/top/", use_cache=True)

    async def get_foreign_flow(self, symbol: str) -> Any:
        clean_symbol = symbol.upper().replace(".JK", "")
        return await self._get(f"/broker-summary/foreign-flow/{clean_symbol}/", use_cache=True)

    async def get_top_movers(self, periods: str = "7d", n_stock: int = 5) -> Any:
        params = {"periods": periods, "n_stock": n_stock}
        return await self._get("/companies/top-changes/", params=params, use_cache=True)

    # --- SGX / KLSE / MINING ---

    async def get_sgx_companies(self) -> Any:
        return await self._get("/sgx/companies/", use_cache=True)

    async def get_sgx_top(self) -> Any:
        return await self._get("/sgx/companies/top/", use_cache=True)

    async def get_mining_commodities(self) -> Any:
        return await self._get("/mining/commodities/", use_cache=True)

    async def get_mining_sites(self) -> Any:
        return await self._get("/mining/sites/", use_cache=True)

    # --- NEWS (SHARED CACHING + 2-HOUR REFRESH + MARKET HOURS 08:30-16:30 WIB) ---

    async def get_news(
        self,
        symbols: Optional[str] = None,
        sector: Optional[str] = None,
        sub_sector: Optional[str] = None,
        tags: Optional[str] = None,
        keyword: Optional[str] = None,
        start: Optional[str] = None,
        end: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        force_refresh: bool = False
    ) -> Dict[str, Any]:
        """
        Fetch news articles with shared caching, 2-hour max TTL, and IDX market hours (08:30-16:30 WIB) enforcement.
        - Shared across all users: saved to Neon PostgreSQL L2 / Memory L1 on first fetch.
        - On-demand user trigger, max refresh interval: 2 hours (7200s).
        - If requested outside 08:30-16:30 WIB or weekend: serves latest saved news without consuming API credits.
        """
        params: Dict[str, Any] = {}
        if symbols: params["symbols"] = symbols
        if sector: params["sector"] = sector
        if sub_sector: params["sub_sector"] = sub_sector
        if tags: params["tags"] = tags
        if keyword: params["keyword"] = keyword
        if start: params["start"] = start
        if end: params["end"] = end
        params["limit"] = min(limit, 30)
        if offset > 0: params["offset"] = offset

        param_items = sorted([(k, str(v)) for k, v in params.items()])
        cache_key = f"/v2/news/:{str(param_items)}"
        
        is_market_open, market_status = is_idx_market_hours()
        cached_entry = cache.get_with_metadata(cache_key)
        
        # Rule 1: Fresh cache exists (< 2 hours old) and not force_refresh
        if cached_entry and not cached_entry["is_expired"] and not force_refresh:
            return {
                "data": cached_entry["data"],
                "cached": True,
                "is_stale": False,
                "is_market_hours": is_market_open,
                "market_status": market_status,
                "source": cached_entry.get("source", "cache"),
                "last_updated": cached_entry.get("created_at"),
                "credit_used": 0
            }

        # Rule 2: Stale cache exists (> 2 hours old) or force_refresh requested,
        # BUT current time is OUTSIDE IDX trading hours (08:30 - 16:30 WIB)
        if cached_entry and not is_market_open:
            return {
                "data": cached_entry["data"],
                "cached": True,
                "is_stale": True,
                "is_market_hours": False,
                "market_status": market_status,
                "source": cached_entry.get("source", "cache_db_off_hours"),
                "notice": "Di luar jam bursa (08:30 - 16:30 WIB). Menampilkan arsip berita terbaru dari database.",
                "last_updated": cached_entry.get("created_at"),
                "credit_used": 0
            }

        # Rule 3: Either inside market hours (and cache expired / force refresh),
        # OR no cached data exists at all (initial query).
        try:
            url = f"{self.base_url}/news/"
            start_time = time.time()
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=self._headers(), params=params)
                elapsed_ms = int((time.time() - start_time) * 1000)
                
                if response.status_code == 200:
                    data = response.json()
                    # Store with 2-hour TTL (7200s) in shared Neon DB & memory
                    cache.set(cache_key, data, ttl_seconds=7200, endpoint="/news/", params=params)
                    return {
                        "data": data,
                        "cached": False,
                        "is_stale": False,
                        "is_market_hours": is_market_open,
                        "market_status": market_status,
                        "source": "sectors_api",
                        "latency_ms": elapsed_ms,
                        "last_updated": datetime.now(WIB_TZ).isoformat(),
                        "credit_used": 1
                    }
                elif cached_entry:
                    return {
                        "data": cached_entry["data"],
                        "cached": True,
                        "is_stale": True,
                        "is_market_hours": is_market_open,
                        "market_status": f"{market_status} (API status {response.status_code}, fallback ke cache)",
                        "source": "cache_fallback",
                        "last_updated": cached_entry.get("created_at"),
                        "credit_used": 0
                    }
                else:
                    response.raise_for_status()
        except Exception as e:
            if cached_entry:
                return {
                    "data": cached_entry["data"],
                    "cached": True,
                    "is_stale": True,
                    "is_market_hours": is_market_open,
                    "market_status": f"Koneksi Sectors gagal ({str(e)}), menampilkan cache tersimpan.",
                    "source": "cache_fallback",
                    "last_updated": cached_entry.get("created_at"),
                    "credit_used": 0
                }
            raise e

    async def get_news_tags(self) -> Any:
        return await self._get("/tags/", use_cache=True, cache_ttl=86400)

sectors_client = SectorsAPIClient()

def get_sectors_client(api_key: Optional[str] = None) -> SectorsAPIClient:
    """Return SectorsAPIClient with custom user key if provided, else shared singleton."""
    if api_key and api_key.strip():
        return SectorsAPIClient(api_key=api_key.strip())
    return sectors_client
