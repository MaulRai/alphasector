from fastapi import APIRouter, Header, Query
from typing import Optional, Dict, Any, List
from app.sectors.mcp_client import get_sectors_mcp_client
from app.core.config import settings

router = APIRouter()

@router.get("/status")
async def get_mcp_status(
    x_sectors_key: Optional[str] = Header(None, alias="X-Sectors-Key"),
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Check real-time health and latency of the Sectors MCP server (sectors-mcp.supertype.ai).
    """
    effective_key = x_sectors_key or (authorization.replace("Bearer ", "") if authorization and "Bearer " in authorization else None)
    client = get_sectors_mcp_client(effective_key)
    health = await client.ping_health()
    return health

@router.get("/tools")
async def get_mcp_tools(
    x_sectors_key: Optional[str] = Header(None, alias="X-Sectors-Key"),
    authorization: Optional[str] = Header(None),
    refresh: bool = Query(False, description="Force refresh from MCP server")
) -> Dict[str, Any]:
    """
    Dynamically discover all tools exposed by the Sectors Model Context Protocol (MCP) server.
    """
    effective_key = x_sectors_key or (authorization.replace("Bearer ", "") if authorization and "Bearer " in authorization else None)
    client = get_sectors_mcp_client(effective_key)
    tools, latency_ms, status = await client.list_tools(use_cache=not refresh)
    
    return {
        "status": "success" if status == 200 else "error",
        "total_tools": len(tools),
        "latency_ms": latency_ms,
        "tools": [
            {
                "name": t.get("name"),
                "description": t.get("description", "").split("\n\n")[0].strip(),
                "full_description": t.get("description", "").strip(),
                "parameters_count": len(t.get("inputSchema", {}).get("properties", {})),
                "required_params": t.get("inputSchema", {}).get("required", [])
            }
            for t in tools
        ]
    }
