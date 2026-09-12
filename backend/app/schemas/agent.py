from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum

class AgentIntent(str, Enum):
    SINGLE_TICKER_DEEP_DIVE = "SINGLE_TICKER_DEEP_DIVE"
    COMPANY_DEEP_DIVE = "SINGLE_TICKER_DEEP_DIVE"
    PEER_BATTLE_COMPARISON = "PEER_BATTLE_COMPARISON"
    MARKET_SCREENING_DISCOVERY = "MARKET_SCREENING_DISCOVERY"
    SMART_MONEY_RADAR = "SMART_MONEY_RADAR"
    INSIDER_FORENSIC_RADAR = "INSIDER_FORENSIC_RADAR"
    INSTITUTIONAL_OWNERSHIP = "INSTITUTIONAL_OWNERSHIP"
    REGULATORY_SUSPENSION_RADAR = "REGULATORY_SUSPENSION_RADAR"
    COMMODITY_MACRO_IMPACT = "COMMODITY_MACRO_IMPACT"
    GENERAL_FINANCIAL_QUERY = "GENERAL_FINANCIAL_QUERY"

class ExecutionPhase(str, Enum):
    PLANNING = "PLANNING"
    FETCHING = "FETCHING"
    COMPARING = "COMPARING"
    SYNTHESIZING = "SYNTHESIZING"
    COMPLETED = "COMPLETED"
    ERROR = "ERROR"

class ToolCallLog(BaseModel):
    endpoint: str
    params: Optional[Dict[str, Any]] = None
    status: int = 200
    latency_ms: int = 0
    description: Optional[str] = None

class ReasoningStep(BaseModel):
    id: str
    step_number: int
    phase: ExecutionPhase
    title: str
    detail: str
    tool_call: Optional[ToolCallLog] = None
    timestamp: str

class AgentQueryRequest(BaseModel):
    query: str = Field(..., description="User question in Indonesian or English")
    context_ticker: Optional[str] = Field(None, description="Optional primary ticker context (e.g. BBCA)")
    session_id: Optional[str] = Field(None, description="Optional session ID for multi-turn conversations")
    image_base64: Optional[str] = Field(None, description="Optional base64-encoded financial image (chart, broxum, financial report)")
    image_mime_type: Optional[str] = Field(None, description="Optional MIME type of image (e.g. image/png, image/jpeg)")

class SynthesisResult(BaseModel):
    executive_summary: str
    key_findings: List[str]
    valuation_verdict: Optional[str] = None
    smart_money_flow: Optional[str] = None
    catalysts: List[str] = []
    risks: List[str] = []
    suggested_followups: List[str] = []
    disclaimer: str

class AgentQueryResponse(BaseModel):
    query: str
    intent: AgentIntent
    session_id: Optional[str] = None
    primary_ticker: Optional[str] = None
    comparison_tickers: List[str] = []
    reasoning_trace: List[ReasoningStep]
    metrics_summary: Optional[Dict[str, Any]] = None
    peer_matrix: Optional[List[Dict[str, Any]]] = None
    broker_summary: Optional[Dict[str, Any]] = None
    synthesis: SynthesisResult
    visual_context: Optional[str] = None
    suggested_followups: List[str] = []
    total_execution_time_ms: int
    credits_consumed: int
