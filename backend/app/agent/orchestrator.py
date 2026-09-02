import asyncio
import time
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.schemas.agent import (
    AgentQueryResponse,
    ReasoningStep,
    ExecutionPhase,
    AgentIntent,
    SynthesisResult
)
from app.agent.planner import planner
from app.agent.tools import tool_executor
from app.agent.comparator import comparator
from app.agent.synthesizer import AgentSynthesizer
from app.sectors.client import sectors_client

class AgentOrchestrator:
    """
    Coordinates end-to-end multi-step reasoning:
    1. Deterministic Intent & Plan DAG Generation
    2. Parallel Sectors REST API Tool Execution (with persistent caching)
    3. Deterministic Financial Ratio & Peer Matrix Computation
    4. Bahasa Indonesia Synthesis with Groq (120b)
    """

    async def execute(self, query: str, context_ticker: Optional[str] = None) -> AgentQueryResponse:
        start_time = time.time()
        trace: List[ReasoningStep] = []
        step_counter = 1
        credits_used = 0

        # -------------------------------------------------------------
        # 1. PLANNING PHASE
        # -------------------------------------------------------------
        intent, tickers, planned_steps = planner.classify_and_plan(query, context_ticker)
        
        target_label = ", ".join(tickers) if tickers else "Market-Wide"
        trace.append(ReasoningStep(
            id=f"step-{step_counter}",
            step_number=step_counter,
            phase=ExecutionPhase.PLANNING,
            title="Intent Classification & Plan Generation",
            detail=f"Intent: {intent.value} | Target Tickers: {target_label} | Planned Steps: {len(planned_steps)}",
            timestamp=datetime.now().strftime("%H:%M:%S")
        ))
        step_counter += 1

        # -------------------------------------------------------------
        # 2. FETCHING PHASE (Parallel Tool Execution)
        # -------------------------------------------------------------
        reports: List[Dict[str, Any]] = []
        broker_summaries: Dict[str, Any] = {}
        foreign_flows: Dict[str, Any] = {}
        screener_data: Optional[Any] = None
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
            elif action in ("SCREEN_MARKET", "RUN_SCREENER"):
                q_text = step.get("query", query)
                data, log = await tool_executor.screen_market(q_text)
                return ("SCREENER", "SCREENER", data, log)
            elif action == "FETCH_TOP_MOVERS":
                data, log = await tool_executor.fetch_top_movers()
                return ("TOP_MOVERS", "TOP_MOVERS", data, log)
            elif action == "FETCH_TOP_INSTITUTIONAL_BROKERS":
                data, log = await tool_executor.fetch_top_institutional_brokers()
                return ("TOP_BROKERS", "TOP_BROKERS", data, log)
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
                emiten_count = len(data) if isinstance(data, list) else 1
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title="Screen Companies Universe",
                    detail=f"Screened IDX universe matching criteria ({emiten_count} emitens retrieved) in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

            elif kind == "TOP_MOVERS":
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title="Fetch Top Movers & Market Momentum",
                    detail=f"Retrieved 7-day gainers/losers leaderboard in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

            elif kind == "TOP_BROKERS":
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title="Fetch Institutional Broker Leaders",
                    detail=f"Retrieved institutional transaction volume ranking in {log.latency_ms}ms",
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
        elif isinstance(screener_data, list) and len(screener_data) > 0:
            # Construct peer matrix from screened companies
            peer_matrix = []
            extracted_tickers = []
            for item in screener_data[:6]:
                if isinstance(item, dict):
                    sym = item.get("symbol", "").replace(".JK", "").upper()
                    if sym:
                        extracted_tickers.append(sym)
                    peer_matrix.append({
                        "symbol": sym,
                        "company_name": item.get("company_name", sym),
                        "sector": item.get("sector", "IDX"),
                        "sub_sector": item.get("sub_sector", "General"),
                        "last_close_price": item.get("last_close_price") or item.get("close"),
                        "market_cap": item.get("market_cap"),
                        "pe": item.get("pe"),
                        "pbv": item.get("pbv") or item.get("pb"),
                        "roe": item.get("roe"),
                        "npm": item.get("net_profit_margin") or item.get("npm"),
                        "tags": [f"ESG: {item['esg_score']}"] if item.get("esg_score") else []
                    })
            if not tickers and extracted_tickers:
                tickers = extracted_tickers
            trace.append(ReasoningStep(
                id=f"step-{step_counter}",
                step_number=step_counter,
                phase=ExecutionPhase.COMPARING,
                title="Screened Peer Universe Ranking & Multiples",
                detail=f"Assembled fundamental multiples, valuations, and criteria metrics across {len(peer_matrix)} screened emitens",
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

        synthesis_result: SynthesisResult = await AgentSynthesizer.synthesize(
            query=query,
            intent=intent,
            tickers=tickers,
            reports=reports,
            peer_matrix=peer_matrix,
            broker_summary=analyzed_broker,
            screener_data={"companies": screener_data} if screener_data else None
        )

        total_ms = int((time.time() - start_time) * 1000)

        # Single Ticker summary metrics
        metrics_summary = peer_matrix[0] if (peer_matrix and len(peer_matrix) == 1) else None

        broker_info = None
        if analyzed_broker:
            broker_info = {
                "sentiment": analyzed_broker["sentiment"],
                "net_foreign_flow_status": analyzed_broker.get("net_foreign_flow_status", "NEUTRAL"),
                "top_buyers": analyzed_broker.get("top_buyers", []),
                "top_sellers": analyzed_broker.get("top_sellers", []),
                "buyer_concentration": analyzed_broker.get("buyer_concentration", 0)
            }

        return AgentQueryResponse(
            query=query,
            intent=intent,
            primary_ticker=primary_ticker,
            comparison_tickers=tickers[1:] if len(tickers) > 1 else [],
            reasoning_trace=trace,
            metrics_summary=metrics_summary,
            peer_matrix=peer_matrix if (peer_matrix and len(peer_matrix) > 1) else None,
            broker_summary=broker_info,
            synthesis=synthesis_result,
            total_execution_time_ms=total_ms,
            credits_consumed=credits_used
        )

agent_orchestrator = AgentOrchestrator()
