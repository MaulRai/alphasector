from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Header
from app.sectors.client import get_sectors_client, sectors_client
from app.core.config import settings

router = APIRouter(prefix="/sectors", tags=["Sectors Financial API"])

@router.get("/subsectors")
async def get_subsectors(x_sectors_api_key: Optional[str] = Header(None)):
    """Get list of IDX sectors and subsectors."""
    client = get_sectors_client(x_sectors_api_key)
    try:
        data, ms, status = await client.get_subsectors()
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/company/{symbol}")
async def get_company_report(
    symbol: str, 
    sections: str = "overview,valuation,financials,peers",
    x_sectors_api_key: Optional[str] = Header(None)
):
    """Get comprehensive company report."""
    client = get_sectors_client(x_sectors_api_key)
    try:
        data, ms, status = await client.get_company_report(symbol, sections=sections)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/company/{symbol}/segments")
async def get_company_segments(
    symbol: str, 
    year: Optional[int] = None,
    x_sectors_api_key: Optional[str] = Header(None)
):
    """Get Sankey revenue & cost segments."""
    client = get_sectors_client(x_sectors_api_key)
    try:
        data, ms, status = await client.get_company_segments(symbol, year=year)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/broker-flow/{symbol}")
async def get_broker_summary(
    symbol: str,
    x_sectors_api_key: Optional[str] = Header(None)
):
    """Get top accumulating & distributing brokers."""
    client = get_sectors_client(x_sectors_api_key)
    try:
        data, ms, status = await client.get_broker_summary_top(symbol)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/foreign-flow/{symbol}")
async def get_foreign_flow(
    symbol: str,
    x_sectors_api_key: Optional[str] = Header(None)
):
    """Get net foreign inflow history."""
    client = get_sectors_client(x_sectors_api_key)
    try:
        data, ms, status = await client.get_foreign_flow(symbol)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/screener")
async def screen_companies(
    where: Optional[str] = Query(None, description="SQL-like WHERE clause"),
    order_by: Optional[str] = Query(None, description="Order by field"),
    limit: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None, description="Natural language query"),
    x_sectors_api_key: Optional[str] = Header(None)
):
    """Screen IDX companies universe."""
    client = get_sectors_client(x_sectors_api_key)
    try:
        data, ms, status = await client.screen_companies(where=where, order_by=order_by, limit=limit, q=q)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-movers")
async def get_top_movers(
    periods: str = "7d", 
    n_stock: int = 5,
    x_sectors_api_key: Optional[str] = Header(None)
):
    """Get top gainers, losers, and volume movers."""
    client = get_sectors_client(x_sectors_api_key)
    try:
        data, ms, status = await client.get_top_movers(periods=periods, n_stock=n_stock)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-brokers")
async def get_top_brokers(
    cohort: str = "all", 
    metric: str = "gross",
    x_sectors_api_key: Optional[str] = Header(None)
):
    """Get top brokers leaderboard."""
    client = get_sectors_client(x_sectors_api_key)
    try:
        data, ms, status = await client.get_top_brokers(cohort=cohort, metric=metric)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

TRADE_IDEAS_MOCK_DATA = {
    "esg-leaders": [
        {"symbol": "BBCA.JK", "company_name": "Bank Central Asia Tbk", "sector": "Financials", "sub_sector": "Banks", "market_cap": 1220500000000000, "pe": 24.2, "pbv": 4.8, "esg_score": 88.5},
        {"symbol": "TLKM.JK", "company_name": "Telkom Indonesia (Persero) Tbk", "sector": "Infrastructure", "sub_sector": "Telecommunication", "market_cap": 320000000000000, "pe": 13.5, "pbv": 2.1, "esg_score": 84.0},
        {"symbol": "ASII.JK", "company_name": "Astra International Tbk", "sector": "Consumer Discretionary", "sub_sector": "Automobiles & Components", "market_cap": 205000000000000, "pe": 6.8, "pbv": 1.0, "esg_score": 81.2},
        {"symbol": "UNVR.JK", "company_name": "Unilever Indonesia Tbk", "sector": "Consumer Non-Cyclicals", "sub_sector": "Household & Personal Products", "market_cap": 95000000000000, "pe": 18.2, "pbv": 19.5, "esg_score": 79.0},
        {"symbol": "MEDC.JK", "company_name": "Medco Energi Internasional Tbk", "sector": "Energy", "sub_sector": "Oil, Gas & Coal", "market_cap": 32500000000000, "pe": 6.2, "pbv": 1.1, "esg_score": 76.5},
        {"symbol": "PGAS.JK", "company_name": "Perusahaan Gas Negara Tbk", "sector": "Utilities", "sub_sector": "Gas Utilities", "market_cap": 38000000000000, "pe": 7.1, "pbv": 0.8, "esg_score": 74.8}
    ],
    "revenue-growth": [
        {"symbol": "AMMN.JK", "company_name": "Amman Mineral Internasional Tbk", "sector": "Basic Materials", "sub_sector": "Metals & Mining", "market_cap": 640000000000000, "pe": 38.5, "pbv": 5.2, "revenue_growth_yoy": 88.4},
        {"symbol": "BREN.JK", "company_name": "Barito Renewables Energy Tbk", "sector": "Energy", "sub_sector": "Renewable Energy", "market_cap": 890000000000000, "pe": 145.0, "pbv": 78.0, "revenue_growth_yoy": 62.1},
        {"symbol": "AUTO.JK", "company_name": "Astra Otoparts Tbk", "sector": "Consumer Discretionary", "sub_sector": "Auto Components", "market_cap": 11200000000000, "pe": 5.6, "pbv": 0.7, "revenue_growth_yoy": 34.2},
        {"symbol": "MAPA.JK", "company_name": "MAP Aktif Adiperkasa Tbk", "sector": "Consumer Cyclicals", "sub_sector": "Apparel Retail", "market_cap": 28500000000000, "pe": 14.8, "pbv": 3.2, "revenue_growth_yoy": 41.0},
        {"symbol": "ACES.JK", "company_name": "Aspirasi Hidup Indonesia Tbk", "sector": "Consumer Cyclicals", "sub_sector": "Specialty Retail", "market_cap": 14800000000000, "pe": 17.5, "pbv": 2.4, "revenue_growth_yoy": 22.8},
        {"symbol": "MAPI.JK", "company_name": "Mitra Adiperkasa Tbk", "sector": "Consumer Cyclicals", "sub_sector": "Department Stores", "market_cap": 26200000000000, "pe": 12.1, "pbv": 2.3, "revenue_growth_yoy": 29.5}
    ],
    "large-shareholder": [
        {"symbol": "BBRI.JK", "company_name": "Bank Rakyat Indonesia (Persero) Tbk", "sector": "Financials", "sub_sector": "Banks", "market_cap": 745000000000000, "pe": 12.4, "pbv": 2.2, "major_shareholder_pct": 53.19},
        {"symbol": "BMRI.JK", "company_name": "Bank Mandiri (Persero) Tbk", "sector": "Financials", "sub_sector": "Banks", "market_cap": 610000000000000, "pe": 11.2, "pbv": 2.1, "major_shareholder_pct": 52.0},
        {"symbol": "ICBP.JK", "company_name": "Indofood CBP Sukses Makmur Tbk", "sector": "Consumer Non-Cyclicals", "sub_sector": "Packaged Foods & Meats", "market_cap": 132000000000000, "pe": 15.1, "pbv": 3.1, "major_shareholder_pct": 80.53},
        {"symbol": "INDF.JK", "company_name": "Indofood Sukses Makmur Tbk", "sector": "Consumer Non-Cyclicals", "sub_sector": "Agricultural Products", "market_cap": 58500000000000, "pe": 6.9, "pbv": 0.9, "major_shareholder_pct": 50.07},
        {"symbol": "MYOR.JK", "company_name": "Mayora Indah Tbk", "sector": "Consumer Non-Cyclicals", "sub_sector": "Packaged Foods & Meats", "market_cap": 54000000000000, "pe": 17.8, "pbv": 3.4, "major_shareholder_pct": 59.07},
        {"symbol": "CPIN.JK", "company_name": "Charoen Pokphand Indonesia Tbk", "sector": "Consumer Non-Cyclicals", "sub_sector": "Farming & Poultry", "market_cap": 82000000000000, "pe": 26.4, "pbv": 2.8, "major_shareholder_pct": 55.53}
    ],
    "efficient-operators": [
        {"symbol": "ITMG.JK", "company_name": "Indo Tambangraya Megah Tbk", "sector": "Energy", "sub_sector": "Coal & Consumable Fuels", "market_cap": 29500000000000, "pe": 4.8, "pbv": 1.1, "net_profit_margin": 28.5},
        {"symbol": "PTBA.JK", "company_name": "Bukit Asam Tbk", "sector": "Energy", "sub_sector": "Coal & Consumable Fuels", "market_cap": 28000000000000, "pe": 5.8, "pbv": 1.3, "net_profit_margin": 24.1},
        {"symbol": "ADRO.JK", "company_name": "Adaro Energy Indonesia Tbk", "sector": "Energy", "sub_sector": "Coal & Energy Logistics", "market_cap": 115000000000000, "pe": 4.2, "pbv": 0.9, "net_profit_margin": 26.8},
        {"symbol": "SMDR.JK", "company_name": "Samudera Indonesia Tbk", "sector": "Transportation & Logistics", "sub_sector": "Marine Logistics", "market_cap": 5800000000000, "pe": 4.1, "pbv": 0.6, "net_profit_margin": 21.0},
        {"symbol": "MBAP.JK", "company_name": "Mitrabara Adiperdana Tbk", "sector": "Energy", "sub_sector": "Coal & Energy", "market_cap": 4200000000000, "pe": 5.1, "pbv": 1.4, "net_profit_margin": 29.2},
        {"symbol": "AKRA.JK", "company_name": "AKR Corporindo Tbk", "sector": "Energy", "sub_sector": "Oil & Gas Storage & Logistics", "market_cap": 31000000000000, "pe": 10.9, "pbv": 2.2, "net_profit_margin": 12.5}
    ]
}

PRESET_QUERIES = {
    "esg-leaders": {"where": "esg_score IS NOT NULL", "order_by": "-esg_score"},
    "revenue-growth": {"where": "revenue[2024] IS NOT NULL and revenue[2023] IS NOT NULL and revenue[2024] > revenue[2023]", "order_by": "-(revenue[2024]/revenue[2023])"},
    "large-shareholder": {"where": "executives_shareholdings_share_percentage >= 0.70 OR major_shareholders_share_percentage >= 0.70", "order_by": "-market_cap"},
    "efficient-operators": {"where": "earnings[2024] IS NOT NULL and employee_num > 50", "order_by": "-(earnings[2024]/employee_num)"}
}

@router.get("/trade-ideas/{idea_slug}")
async def get_trade_idea_preset(
    idea_slug: str,
    x_sectors_api_key: Optional[str] = Header(None)
):
    """
    Execute curated Trade Ideas radar presets.
    - If USE_MOCK_DATA=true (default in dev/demo): Returns instant, zero-cost curated mock dataset.
    - If USE_MOCK_DATA=false: Dispatches live dynamic query to Sectors Financial API.
    """
    if idea_slug not in TRADE_IDEAS_MOCK_DATA and idea_slug not in PRESET_QUERIES:
        raise HTTPException(status_code=400, detail=f"Unknown trade idea slug: {idea_slug}.")
        
    # 1. If mock flag is enabled in .env, return high-fidelity mock data (0 credit consumption)
    if settings.USE_MOCK_DATA:
        mock_data = TRADE_IDEAS_MOCK_DATA.get(idea_slug, [])
        return {
            "preset": idea_slug,
            "data": mock_data,
            "latency_ms": 1,
            "is_mock": True
        }

    # 2. Otherwise execute live Sectors API query
    preset = PRESET_QUERIES.get(idea_slug)
    if not preset:
        raise HTTPException(status_code=400, detail=f"No live query defined for {idea_slug}")
        
    client = get_sectors_client(x_sectors_api_key)
    try:
        data, ms, status = await client.screen_companies(where=preset["where"], order_by=preset["order_by"], limit=10)
        return {"preset": idea_slug, "data": data, "latency_ms": ms, "is_mock": False}
    except Exception as e:
        # Fallback to mock data on error so UI never breaks
        fallback = TRADE_IDEAS_MOCK_DATA.get(idea_slug, [])
        return {"preset": idea_slug, "data": fallback, "latency_ms": 1, "is_mock": True, "fallback": True}

@router.post("/verify-key")
async def verify_sectors_api_key(payload: dict):
    """Verify if a user's Sectors API key is valid by testing connectivity."""
    from app.sectors.client import SectorsAPIClient
    api_key = payload.get("api_key", "").strip()
    if not api_key:
        raise HTTPException(status_code=400, detail="Sectors API key tidak boleh kosong.")
    
    test_client = SectorsAPIClient(api_key=api_key)
    try:
        data, ms, status = await test_client.get_subsectors()
        return {
            "status": "valid",
            "message": "Sectors API Key terverifikasi & aktif!",
            "latency_ms": ms
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"API Key tidak valid atau dinonaktifkan: {str(e)}")
