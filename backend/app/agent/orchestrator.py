import time
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.schemas.agent import (
    AgentIntent, ExecutionPhase, ReasoningStep,
    ToolCallLog, AgentQueryResponse, SynthesisResult
)
from app.agent.planner import AgentPlanner
from app.agent.tools import tool_executor
from app.agent.comparator import comparator
from app.agent.synthesizer import synthesizer

class AgentOrchestrator:
    """Multi-step custom agent orchestrator powering AlphaSector."""

    async def execute(self, query: str, context_ticker: Optional[str] = None) -> AgentQueryResponse:
        start_time = time.time()
        trace: List[ReasoningStep] = []
        step_counter = 1
        credits_used = 0

        # -------------------------------------------------------------
        # 1. PLANNING PHASE
        # -------------------------------------------------------------
        intent, tickers, planned_steps = AgentPlanner.plan(query, context_ticker)
        
        trace.append(ReasoningStep(
            id=f"step-{step_counter}",
            step_number=step_counter,
            phase=ExecutionPhase.PLANNING,
            title="Intent Classification & Plan Generation",
            detail=f"Intent: {intent.value} | Target Tickers: {', '.join(tickers) if tickers else 'Market-Wide'} | Planned Steps: {len(planned_steps)}",
            timestamp=datetime.now().strftime("%H:%M:%S")
        ))
        step_counter += 1

        # -------------------------------------------------------------
        # 2. FETCHING PHASE (Custom Tool Execution Pipeline)
        # -------------------------------------------------------------
        reports: List[Dict[str, Any]] = []
        broker_summaries: Dict[str, Any] = {}
        foreign_flows: Dict[str, Any] = {}
        screener_data: Optional[Dict[str, Any]] = None
        segments_data: Dict[str, Any] = {}

        for step in planned_steps:
            action = step.get("action")
            
            if action == "FETCH_REPORT":
                t = step["ticker"]
                data, log = await tool_executor.fetch_company_report(t)
                if data:
                    reports.append(data)
                credits_used += 1
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Company Report ({t})",
                    detail=f"Retrieved fundamental overview, valuation multiples, and financials for {t} in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

            elif action == "FETCH_BROKER_SUMMARY":
                t = step["ticker"]
                data, log = await tool_executor.fetch_broker_summary(t)
                if data:
                    broker_summaries[t] = data
                credits_used += 1
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Broker Summary ({t})",
                    detail=f"Retrieved top accumulating & distributing brokers for {t} in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

            elif action == "FETCH_FOREIGN_FLOW":
                t = step["ticker"]
                data, log = await tool_executor.fetch_foreign_flow(t)
                if data:
                    foreign_flows[t] = data
                credits_used += 1
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Net Foreign Flow ({t})",
                    detail=f"Retrieved historical net foreign broker inflow for {t}",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

            elif action == "FETCH_SEGMENTS":
                t = step["ticker"]
                data, log = await tool_executor.fetch_company_segments(t)
                if data:
                    segments_data[t] = data
                credits_used += 1
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Revenue Segments ({t})",
                    detail=f"Retrieved Sankey-ready revenue & cost streams for {t}",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

            elif action == "SCREEN_MARKET":
                q_text = step.get("query", query)
                data, log = await tool_executor.screen_market(q_text)
                if data:
                    screener_data = data
                credits_used += 3 # Natural language screener
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title="Screen Market Universe",
                    detail=f"Executed AI screener query across IDX companies universe in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

            elif action == "FETCH_TOP_INSTITUTIONAL_BROKERS":
                data, log = await tool_executor.fetch_top_institutional_brokers()
                credits_used += 1
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title="Fetch Top Institutional Brokers",
                    detail=f"Retrieved top market-wide institutional broker activity in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

            elif action == "FETCH_TOP_MOVERS":
                data, log = await tool_executor.fetch_top_movers()
                credits_used += 1
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title="Fetch Market Top Movers",
                    detail="Retrieved top gainers & losers for momentum benchmark",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

        # -------------------------------------------------------------
        # 3. QUANTITATIVE COMPARATOR PHASE
        # -------------------------------------------------------------
        peer_matrix = None
        analyzed_broker = None
        
        if reports:
            peer_matrix = comparator.build_peer_matrix(reports)
            trace.append(ReasoningStep(
                id=f"step-{step_counter}",
                step_number=step_counter,
                phase=ExecutionPhase.COMPARING,
                title="Quantitative Comparison & Financial Math",
                detail=f"Computed PE gap, PBV gap, ROE profitability, and dividend yield rankings across {len(peer_matrix)} emiten",
                timestamp=datetime.now().strftime("%H:%M:%S")
            ))
            step_counter += 1

        primary_ticker = tickers[0] if tickers else None
        if primary_ticker and primary_ticker in broker_summaries:
            analyzed_broker = comparator.analyze_broker_sentiment(broker_summaries[primary_ticker])
            trace.append(ReasoningStep(
                id=f"step-{step_counter}",
                step_number=step_counter,
                phase=ExecutionPhase.COMPARING,
                title="Smart Money & Accumulation Signal Analysis",
                detail=f"Signal: {analyzed_broker.get('sentiment')} (Buyer Concentration: {analyzed_broker.get('buyer_concentration')}%)",
                timestamp=datetime.now().strftime("%H:%M:%S")
            ))
            step_counter += 1

        # -------------------------------------------------------------
        # 4. SYNTHESIZING PHASE
        # -------------------------------------------------------------
        synthesis = await synthesizer.synthesize(
            query=query,
            intent=intent,
            tickers=tickers,
            reports=reports,
            peer_matrix=peer_matrix,
            broker_summary=analyzed_broker,
            screener_data=screener_data
        )

        trace.append(ReasoningStep(
            id=f"step-{step_counter}",
            step_number=step_counter,
            phase=ExecutionPhase.SYNTHESIZING,
            title="Structured Narrative Synthesis & Fact Grounding",
            detail="Generated executive summary, valuation verdict, catalysts, and regulatory disclaimers",
            timestamp=datetime.now().strftime("%H:%M:%S")
        ))
        step_counter += 1

        total_time_ms = int((time.time() - start_time) * 1000)

        # -------------------------------------------------------------
        # 5. RESPONSE ASSEMBLY
        # -------------------------------------------------------------
        metrics_summary = None
        if peer_matrix and len(peer_matrix) == 1:
            metrics_summary = peer_matrix[0]

        return AgentQueryResponse(
            query=query,
            intent=intent,
            primary_ticker=primary_ticker,
            comparison_tickers=tickers[1:] if len(tickers) > 1 else [],
            reasoning_trace=trace,
            metrics_summary=metrics_summary,
            peer_matrix=peer_matrix,
            broker_summary=analyzed_broker,
            synthesis=synthesis,
            total_execution_time_ms=total_time_ms,
            credits_consumed=credits_used
        )

agent_orchestrator = AgentOrchestrator()
