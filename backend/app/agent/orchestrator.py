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
from app.agent.planner import planner, contains_keyword
from app.agent.tools import tool_executor
from app.agent.comparator import comparator
from app.agent.synthesizer import AgentSynthesizer
from app.sectors.client import sectors_client
from app.core.gemini_rotator import gemini_rotator

class AgentOrchestrator:
    """
    Coordinates end-to-end multi-step reasoning:
    0. Multimodal Visual Perception (Gemini Flash Vision)
    1. Deterministic Intent & Plan DAG Generation
    2. Parallel Sectors REST API Tool Execution (with persistent caching)
    3. Deterministic Financial Ratio & Peer Matrix Computation
    4. Bahasa Indonesia Synthesis with Groq (120b)
    """

    async def execute(
        self, 
        query: str, 
        context_ticker: Optional[str] = None, 
        session_id: Optional[str] = None,
        custom_api_key: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        image_base64: Optional[str] = None,
        image_mime_type: Optional[str] = None
    ) -> AgentQueryResponse:
        start_time = time.time()
        trace: List[ReasoningStep] = []
        step_counter = 1
        credits_used = 0
        visual_context: Optional[str] = None

        # -------------------------------------------------------------
        # -1. MULTIMODAL VISION PERCEPTION PHASE (Gemini Flash)
        # -------------------------------------------------------------
        if image_base64 and gemini_rotator.has_keys():
            try:
                mime = image_mime_type or "image/png"
                vision_res = await gemini_rotator.analyze_financial_image(
                    image_base64=image_base64,
                    mime_type=mime,
                    user_prompt=query
                )
                if vision_res.get("success"):
                    visual_context = vision_res.get("visual_summary", "")
                    detected_img_ticker = vision_res.get("detected_ticker")
                    if detected_img_ticker and not context_ticker:
                        context_ticker = detected_img_ticker

                    trace.append(ReasoningStep(
                        id=f"step-{step_counter}",
                        step_number=step_counter,
                        phase=ExecutionPhase.FETCHING,
                        title="Multimodal Financial Vision Perception",
                        detail=f"Extracted visual chart/report intelligence via {vision_res.get('model', 'gemini-2.5-flash')}" + (f" | Identified Ticker: {detected_img_ticker}" if detected_img_ticker else ""),
                        timestamp=datetime.now().strftime("%H:%M:%S")
                    ))
                    step_counter += 1
            except Exception as vision_err:
                print(f"[Warning] Gemini vision analysis failed: {vision_err}")
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.ERROR,
                    title="Multimodal Vision Warning",
                    detail=f"Could not parse image context: {vision_err}",
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                step_counter += 1

        # Enrich query with visual context if available
        effective_query = query
        if visual_context:
            effective_query = f"{query}\n\n[KONTEKS OBSERVASI VISUAL DARI GAMBAR TERLAMPIR (GEMINI FLASH VISION)]:\n{visual_context}"

        # -------------------------------------------------------------
        # 0. HYBRID INTENT ARBITER (For Multi-Turn Sessions)
        # -------------------------------------------------------------
        if conversation_history and len(conversation_history) > 0:
            query_lower = query.lower().strip()
            
            # 1. Markers indicating a pure conversational discussion / table / advice
            conversational_markers = [
                "jelaskan", "kenapa", "mengapa", "bagaimana", "apakah", "menurutmu", "pendapat",
                "buatkan tabel", "tabel ringkas", "tabel perbandingan", "tabel pros", "pros", "cons",
                "kelebihan", "kekurangan", "alokasi", "simulasi", "rangkum", "ringkas", "kesimpulan",
                "saran", "rekomendasi alokasi", "tersebut", "tadi", "di atas", "keduanya", "semuanya",
                "keenam", "ketiga", "keempat", "kelima", "analisiskan poin", "apa itu", "arti dari"
            ]
            is_conversational_marker = any(m in query_lower for m in conversational_markers)

            # 2. Extract any newly mentioned stock tickers in the query
            detected_tickers = planner.parse_tickers(query)

            # 3. Check if user is asking for a fresh market-wide screening / filtering
            screening_verbs = ["screen", "screener", "filter", "cari saham", "temukan saham", "top saham", "saham terbaik", "saham dividen"]
            is_screening_intent = any(v in query_lower for v in screening_verbs) and len(detected_tickers) == 0

            # 4. Check if user is introducing 2+ distinct tickers for a brand new Peer Battle
            is_peer_battle_intent = len(detected_tickers) >= 2 and not is_conversational_marker

            # 5. Check explicit command keywords
            explicit_triggers = ["jalankan riset baru", "buat dosir baru", "full battle", "deep dive baru", "riset lengkap"]
            is_explicit_command = any(t in query_lower for t in explicit_triggers)

            # Determine whether to run Full Agentic DAG or Fast Conversational Response
            should_run_full_agentic = (is_peer_battle_intent or is_screening_intent or is_explicit_command) and not is_conversational_marker

            if not should_run_full_agentic:
                trace.append(ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.SYNTHESIZING,
                    title="Conversational Financial Reasoning",
                    detail="Formulating direct structured response based on active multi-turn research context",
                    timestamp=datetime.now().strftime("%H:%M:%S")
                ))
                synthesis_result = await AgentSynthesizer.synthesize_conversational(
                    query=query,
                    conversation_history=conversation_history
                )
                total_ms = int((time.time() - start_time) * 1000)
                return AgentQueryResponse(
                    query=query,
                    intent=AgentIntent.GENERAL_FINANCIAL_QUERY,
                    session_id=session_id,
                    primary_ticker=context_ticker,
                    comparison_tickers=[],
                    reasoning_trace=trace,
                    metrics_summary=None,
                    peer_matrix=None,
                    broker_summary=None,
                    synthesis=synthesis_result,
                    visual_context=visual_context,
                    suggested_followups=[],
                    total_execution_time_ms=total_ms,
                    credits_consumed=1
                )

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
                data, log = await tool_executor.fetch_company_report(t, api_key=custom_api_key)
                return ("REPORT", t, data, log)
            elif action == "FETCH_BROKER_SUMMARY":
                t = step["ticker"]
                data, log = await tool_executor.fetch_broker_summary(t, api_key=custom_api_key)
                return ("BROKER", t, data, log)
            elif action == "FETCH_FOREIGN_FLOW":
                t = step["ticker"]
                data, log = await tool_executor.fetch_foreign_flow(t, api_key=custom_api_key)
                return ("FOREIGN", t, data, log)
            elif action == "FETCH_SEGMENTS":
                t = step["ticker"]
                data, log = await tool_executor.fetch_company_segments(t, api_key=custom_api_key)
                return ("SEGMENTS", t, data, log)
            elif action in ("SCREEN_MARKET", "RUN_SCREENER"):
                q_text = step.get("query", query)
                data, log = await tool_executor.screen_market(q_text, api_key=custom_api_key)
                return ("SCREENER", "SCREENER", data, log)
            elif action == "FETCH_TOP_MOVERS":
                data, log = await tool_executor.fetch_top_movers(api_key=custom_api_key)
                return ("TOP_MOVERS", "TOP_MOVERS", data, log)
            elif action == "FETCH_TOP_INSTITUTIONAL_BROKERS":
                data, log = await tool_executor.fetch_top_institutional_brokers(api_key=custom_api_key)
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

        # Determine valid primary ticker from peer_matrix with real data
        if peer_matrix and len(peer_matrix) > 0 and peer_matrix[0].get("symbol"):
            primary_ticker = peer_matrix[0].get("symbol")
        elif tickers:
            primary_ticker = tickers[0]
        else:
            primary_ticker = None

        if primary_ticker and primary_ticker in broker_summaries:
            analyzed_broker = comparator.analyze_broker_sentiment(broker_summaries[primary_ticker])
            trace.append(ReasoningStep(
                id=f"step-{step_counter}",
                step_number=step_counter,
                phase=ExecutionPhase.COMPARING,
                title=f"Smart Money Concentration Analysis ({primary_ticker})",
                detail=f"Classified broker flow as {analyzed_broker.get('sentiment', 'NEUTRAL')} with {analyzed_broker.get('buyer_concentration', 0)}% buyer concentration",
                timestamp=datetime.now().strftime("%H:%M:%S")
            ))
            step_counter += 1
        elif broker_summaries:
            first_valid_broker = next((sym for sym in broker_summaries if broker_summaries[sym]), None)
            if first_valid_broker:
                analyzed_broker = comparator.analyze_broker_sentiment(broker_summaries[first_valid_broker])

        # -------------------------------------------------------------
        # 4. SYNTHESIS PHASE (LLM Structured Report Generation)
        # -------------------------------------------------------------
        synthesis_result: SynthesisResult = await AgentSynthesizer.synthesize(
            query=effective_query,
            intent=intent,
            tickers=tickers,
            reports=reports,
            peer_matrix=peer_matrix,
            broker_summary=analyzed_broker,
            screener_data={"companies": screener_data} if screener_data else None
        )

        trace.append(ReasoningStep(
            id=f"step-{step_counter}",
            step_number=step_counter,
            phase=ExecutionPhase.SYNTHESIZING,
            title="Institutional Autonomous Synthesis",
            detail=f"Generated executive verdict, key findings, and catalysts in Indonesian language",
            timestamp=datetime.now().strftime("%H:%M:%S")
        ))

        total_ms = int((time.time() - start_time) * 1000)

        # Build clean comparison_tickers from peer_matrix
        valid_comp_tickers = []
        if peer_matrix:
            valid_comp_tickers = [p.get("symbol") for p in peer_matrix if p.get("symbol") and p.get("symbol") != primary_ticker]
        elif tickers and len(tickers) > 1:
            valid_comp_tickers = [t for t in tickers if t != primary_ticker]

        metrics_summary = None
        if reports and len(reports) > 0:
            first_rep = next((r for r in reports if r and r.get("symbol") == primary_ticker), reports[0])
            if first_rep and first_rep.get("overview"):
                metrics_summary = {
                    "primary_ticker": primary_ticker,
                    "company_name": first_rep.get("company_name", primary_ticker),
                    "sector": first_rep.get("overview", {}).get("sector", "-"),
                    "market_cap": first_rep.get("overview", {}).get("market_cap")
                }

        broker_info = None
        if analyzed_broker:
            broker_info = {
                "sentiment": analyzed_broker.get("sentiment", "NEUTRAL"),
                "net_foreign_flow_status": analyzed_broker.get("net_foreign_flow_status", "NEUTRAL"),
                "top_buyers": analyzed_broker.get("top_buyers", []),
                "top_sellers": analyzed_broker.get("top_sellers", []),
                "buyer_concentration": analyzed_broker.get("buyer_concentration", 0)
            }

        return AgentQueryResponse(
            query=query,
            intent=intent,
            session_id=session_id,
            primary_ticker=primary_ticker,
            comparison_tickers=valid_comp_tickers,
            reasoning_trace=trace,
            metrics_summary=metrics_summary,
            peer_matrix=peer_matrix if (peer_matrix and len(peer_matrix) > 1) else None,
            broker_summary=broker_info,
            synthesis=synthesis_result,
            visual_context=visual_context,
            suggested_followups=synthesis_result.suggested_followups if synthesis_result else [],
            total_execution_time_ms=total_ms,
            credits_consumed=credits_used
        )

agent_orchestrator = AgentOrchestrator()
