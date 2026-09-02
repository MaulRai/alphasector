from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.sectors.client import sectors_client

router = APIRouter(prefix="/sectors", tags=["Sectors Financial API"])

@router.get("/subsectors")
async def get_subsectors():
    """Get list of IDX sectors and subsectors."""
    try:
        data, ms, status = await sectors_client.get_subsectors()
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/company/{symbol}")
async def get_company_report(symbol: str, sections: str = "overview,valuation,financials,peers"):
    """Get comprehensive company report."""
    try:
        data, ms, status = await sectors_client.get_company_report(symbol, sections=sections)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/company/{symbol}/segments")
async def get_company_segments(symbol: str, year: Optional[int] = None):
    """Get Sankey revenue & cost segments."""
    try:
        data, ms, status = await sectors_client.get_company_segments(symbol, year=year)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/broker-flow/{symbol}")
async def get_broker_summary(symbol: str):
    """Get top accumulating & distributing brokers."""
    try:
        data, ms, status = await sectors_client.get_broker_summary_top(symbol)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/foreign-flow/{symbol}")
async def get_foreign_flow(symbol: str):
    """Get net foreign inflow history."""
    try:
        data, ms, status = await sectors_client.get_foreign_flow(symbol)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/screener")
async def screen_companies(
    where: Optional[str] = Query(None, description="SQL-like WHERE clause"),
    order_by: Optional[str] = Query(None, description="Order by field"),
    limit: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None, description="Natural language query")
):
    """Screen IDX companies universe."""
    try:
        data, ms, status = await sectors_client.screen_companies(where=where, order_by=order_by, limit=limit, q=q)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-movers")
async def get_top_movers(periods: str = "7d", n_stock: int = 5):
    """Get top gainers, losers, and volume movers."""
    try:
        data, ms, status = await sectors_client.get_top_movers(periods=periods, n_stock=n_stock)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-brokers")
async def get_top_brokers(cohort: str = "all", metric: str = "gross"):
    """Get top brokers leaderboard."""
    try:
        data, ms, status = await sectors_client.get_top_brokers(cohort=cohort, metric=metric)
        return {"data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trade-ideas/{idea_slug}")
async def get_trade_idea_preset(idea_slug: str):
    """Execute curated Trade Ideas radar presets."""
    preset_queries = {
        "esg-leaders": {"where": "esg_score IS NOT NULL", "order_by": "-esg_score"},
        "revenue-growth": {"where": "revenue[2024] IS NOT NULL and revenue[2023] IS NOT NULL and revenue[2024] > revenue[2023]", "order_by": "-(revenue[2024]/revenue[2023])"},
        "large-shareholder": {"where": "executives_shareholdings_share_percentage >= 0.70 OR major_shareholders_share_percentage >= 0.70", "order_by": "-market_cap"},
        "efficient-operators": {"where": "earnings[2024] IS NOT NULL and employee_num > 50", "order_by": "-(earnings[2024]/employee_num)"}
    }
    
    if idea_slug not in preset_queries:
        raise HTTPException(status_code=400, detail=f"Unknown trade idea slug: {idea_slug}. Choices: {list(preset_queries.keys())}")
        
    preset = preset_queries[idea_slug]
    try:
        data, ms, status = await sectors_client.screen_companies(where=preset["where"], order_by=preset["order_by"], limit=10)
        return {"preset": idea_slug, "data": data, "latency_ms": ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
