"""
Sectors API v2 Python Client Wrapper
A lightweight, typed Python client for interacting with Sectors Financial API.
"""

import os
from typing import Dict, List, Optional, Any, Union
import requests
from dotenv import load_dotenv
from pathlib import Path

class SectorsAPIClient:
    """Client for Sectors Financial API v2."""
    
    BASE_URL = "https://api.sectors.app/v2"
    
    def __init__(self, api_key: Optional[str] = None, timeout: int = 20):
        if not api_key:
            # Look in environment or .env
            load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")
            api_key = os.getenv("SECTORS_API_KEY")
            
        if not api_key:
            raise ValueError("API Key is required. Set SECTORS_API_KEY in .env or pass it explicitly.")
            
        self.api_key = api_key
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": self.api_key,
            "Content-Type": "application/json",
            "User-Agent": "Sectors-Python-SDK/2.0"
        })

    def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self.BASE_URL}{endpoint}"
        response = self.session.get(url, params=params, timeout=self.timeout)
        response.raise_for_status()
        return response.json()

    def _post(self, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self.BASE_URL}{endpoint}"
        response = self.session.post(url, json=data, timeout=self.timeout)
        response.raise_for_status()
        return response.json()

    # --- INDONESIA (IDX) ENDPOINTS ---
    
    def get_subsectors(self) -> List[Dict[str, Any]]:
        """Get all available IDX sector and subsector pairs."""
        return self._get("/subsectors/")

    def get_industries(self) -> List[Dict[str, Any]]:
        """Get all available IDX subsector and industry pairs."""
        return self._get("/industries/")

    def get_subindustries(self) -> List[Dict[str, Any]]:
        """Get all available IDX industry and sub-industry pairs."""
        return self._get("/subindustries/")

    def get_tags(self) -> List[str]:
        """Get all available tag slugs used across news and filings."""
        return self._get("/tags/")

    def screen_companies(
        self,
        q: Optional[str] = None,
        where: Optional[str] = None,
        order_by: Optional[str] = None,
        sector: Optional[str] = None,
        sub_sector: Optional[str] = None,
        industry: Optional[str] = None,
        sub_industry: Optional[str] = None,
        n_companies: Optional[int] = None,
        page: Optional[int] = None
    ) -> Dict[str, Any]:
        """Screen IDX companies using structured query or natural language query (q)."""
        params = {}
        if q: params["q"] = q
        if where: params["where"] = where
        if order_by: params["order_by"] = order_by
        if sector: params["sector"] = sector
        if sub_sector: params["sub_sector"] = sub_sector
        if industry: params["industry"] = industry
        if sub_industry: params["sub_industry"] = sub_industry
        if n_companies: params["n_companies"] = n_companies
        if page: params["page"] = page
        return self._get("/companies/", params=params)

    def get_company_report(self, symbol: str, sections: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive company report for an IDX ticker (e.g. BBCA)."""
        params = {}
        if sections:
            params["sections"] = sections
        return self._get(f"/company/report/{symbol}/", params=params)

    def get_company_segments(self, symbol: str, year: Optional[int] = None) -> Dict[str, Any]:
        """Get Sankey-ready revenue and cost breakdown for a company."""
        params = {"year": year} if year else {}
        return self._get(f"/company/segments/{symbol}/", params=params)

    def get_broker_registry(self) -> List[Dict[str, Any]]:
        """Get curated registry of IDX exchange-member brokers."""
        return self._get("/broker-registry/")

    def get_broker_summary_top(self, symbol: str, start: Optional[str] = None, end: Optional[str] = None) -> Dict[str, Any]:
        """Get top accumulating and distributing brokers for a stock."""
        params = {}
        if start: params["start"] = start
        if end: params["end"] = end
        return self._get(f"/broker-summary/top/{symbol}/", params=params)

    def get_foreign_flow(self, symbol: str, start: Optional[str] = None, end: Optional[str] = None) -> Dict[str, Any]:
        """Get daily net foreign-broker inflow for a stock."""
        params = {}
        if start: params["start"] = start
        if end: params["end"] = end
        return self._get(f"/broker-summary/foreign-flow/{symbol}/", params=params)

    def get_top_movers(self, period: str = "7d", classification: Optional[str] = None) -> Dict[str, Any]:
        """Get top gainers/losers across time periods (1d, 7d, 14d, 30d, 365d)."""
        params = {"period": period}
        if classification: params["classification"] = classification
        return self._get("/top-changes/", params=params)

    # --- SINGAPORE (SGX) ENDPOINTS ---
    
    def screen_sgx_companies(self, q: Optional[str] = None, n_companies: Optional[int] = None) -> Dict[str, Any]:
        """Screen SGX companies."""
        params = {}
        if q: params["q"] = q
        if n_companies: params["n_companies"] = n_companies
        return self._get("/sgx/companies/", params=params)

    def get_sgx_company_report(self, symbol: str) -> Dict[str, Any]:
        """Get report for an SGX ticker (e.g. D05)."""
        return self._get(f"/sgx/company/report/{symbol}/")

    # --- MINING EXTENSION ENDPOINTS ---
    
    def get_mining_commodities(self) -> List[Dict[str, Any]]:
        """Get list of commodities in the price database."""
        return self._get("/mining/commodities/")

    def get_mining_sites(self, commodity_type: Optional[str] = None) -> Dict[str, Any]:
        """Get mining sites with coordinates and reserves."""
        params = {"commodity_type": commodity_type} if commodity_type else {}
        return self._get("/mining/sites/", params=params)
