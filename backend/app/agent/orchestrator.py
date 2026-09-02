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
        # 2. FETCHING PHASE (Parallel Tool Execution Pipeline)
        # -------------------------------------------------------------
        reports: List[Dict[str, Any]] = []
        broker_summaries: Dict[str, Any] = {}
        foreign_flows: Dict[str, Any] = {}
        screener_data: Optional[Dict[str, Any]] = None
        segments_data: Dict[str, Any] = {}

        # Prepare async tasks
        async def execute_single_step(step: Dict[str, Any]):
            action = step.get("action")
            if action == "FETCH_REPORT":
                t = step["ticker"]
                data, log = await tool_executor.fetch_company_report(t)
                return ("REPORT", t, data, log)
            elif action == "FETCH_BROKER_SUMMARY":
                t = step["ticker"]
                data, log = await tool_executor.fetch_broker_summary(t)
                return ("BROKER", t, data, log)
            elif action == "FETCH_FOREIGN_FLOW":
                t = step["ticker"]
                data, log = await tool_executor.fetch_foreign_flow(t)
                return ("FOREIGN", t, data, log)
            elif action == "FETCH_SEGMENTS":
                t = step["ticker"]
                data, log = await tool_executor.fetch_company_segments(t)
                return ("SEGMENTS", t, data, log)
            elif action == "RUN_SCREENER":
                q_text = step.get("query", query)
                data, log = await tool_executor.screen_companies(q=q_text)
                return ("SCREENER", "SCREENER", data, log)
            elif action == "FETCH_SUBSECTOR_LIST":
                data, log = await tool_executor.get_subsectors()
                return ("SUBSECTORS", "SUBSECTORS", data, log)
            return (None, None, None, None)

        # Run all planned fetching tasks concurrently for maximum speed
        results = await asyncio.gather(*[execute_single_step(s) for s in planned_steps])

        for kind, sym, data, log in results:
            if not kind:
                continue
            credits_used += 1

            if kind == "REPORT":
                if data: reports.append(data)
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Company Report ({sym})",
                    detail=f"Retrieved fundamental overview, valuation multiples, and financials for {sym} in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

            elif kind == "BROKER":
                if data: broker_summaries[sym] = data
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Broker Summary ({sym})",
                    detail=f"Retrieved top accumulating & distributing brokers for {sym} in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

            elif kind == "FOREIGN":
                if data: foreign_flows[sym] = data
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Net Foreign Flow ({sym})",
                    detail=f"Retrieved historical net foreign broker inflow for {sym}",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

            elif kind == "SEGMENTS":
                if data: segments_data[sym] = data
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Revenue Segments ({sym})",
                    detail=f"Retrieved business revenue & cost breakdown for {sym}",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

            elif kind == "SCREENER":
                screener_data = data
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title="Screen Companies Universe",
                    detail=f"Screened IDX universe for matching criteria in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

        # -------------------------------------------------------------
        # 3. COMPARISON & RATIO ENGINE (Deterministic Math)
        # -------------------------------------------------------------
        peer_matrix = None
        analyzed_broker = None

        if reports:
            peer_matrix = comparator.build_peer_matrix(reports)
            trace.append(ReasoningStep(
                id=f"step-{step_counter}",
                step_number=step_counter,
                phase=ExecutionPhase.COMPARING,
                title="Deterministic Ratio & Multiples Calculation",
                detail=f"Calculated valuation gaps, ROE, DER, NPM, and identified Best-in-Class badges for {len(peer_matrix)} companies",
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
                title="Broker Accumulation Sentiment Scoring",
                detail=f"Sentiment for {primary_ticker}: {analyzed_broker['sentiment']} (Buyer Concentration: {analyzed_broker['buyer_concentration']}%)",
                timestamp=datetime.now().strftime("%H:%M:%S")
            ))
            step_counter += 1

        # -------------------------------------------------------------
        # 4. SYNTHESIZING PHASE (Bahasa Indonesia LLM Synthesis)
        # -------------------------------------------------------------
        trace.append(ReasoningStep(
            id=f"step-{step_counter}",
            step_number=step_counter,
            phase=ExecutionPhase.SYNTHESIZING,
            title="Executive Narrative Synthesis",
            detail="Generating structured equity research briefing in Bahasa Indonesia with fact-grounded figures",
            timestamp=datetime.now().strftime("%H:%M:%S")
        ))
        step_counter += 1

        synthesis_result = await synthesizer.synthesize(
            query=query,
            intent=intent,
            tickers=tickers,
            reports=reports,
            peer_matrix=peer_matrix,
            broker_summary=analyzed_broker or (broker_summaries.get(primary_ticker) if primary_ticker else None),
            screener_data=screener_data
        )

        total_latency = int((time.time() - start_time) * 1000)

        # Single summary metric if only 1 ticker
        metrics_summary = peer_matrix[0] if peer_matrix and len(peer_matrix) == 1 else None

        return AgentQueryResponse(
            query=query,
            intent=intent,
            primary_ticker=primary_ticker,
            comparison_tickers=tickers[1:] if len(tickers) > 1 else [],
            reasoning_trace=trace,
            metrics_summary=metrics_summary,
            peer_matrix=peer_matrix,
            broker_summary=analyzed_broker,
            synthesis=synthesis_result,
            total_execution_time_ms=total_latency,
            credits_consumed=credits_used
        )

agent_orchestrator = AgentOrchestrator()
