from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.agent import AgentQueryRequest, AgentQueryResponse
from app.agent.orchestrator import agent_orchestrator

router = APIRouter(prefix="/agent", tags=["AI Agent"])

@router.post("/query", response_model=AgentQueryResponse)
async def execute_agent_query(request: AgentQueryRequest):
    """
    Execute autonomous multi-step reasoning query across Sectors Financial API.
    Returns live step-by-step reasoning trace, quantitative metrics, and fact-grounded synthesis.
    """
    try:
        response = await agent_orchestrator.execute(
            query=request.query,
            context_ticker=request.context_ticker
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent Execution Error: {str(e)}")
