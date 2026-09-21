import asyncio
import time
import json
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any, Callable, Awaitable

from app.schemas.agent import (
    AgentQueryResponse,
    ReasoningStep,
    ExecutionPhase,
    AgentIntent,
    SynthesisResult,
    ClarificationPayload,
    ClarificationOption,
)
from app.agent.planner import planner, contains_keyword
from app.agent.tools import tool_executor
from app.agent.comparator import comparator
from app.agent.synthesizer import AgentSynthesizer
from app.sectors.client import sectors_client
from app.core.gemini_rotator import gemini_rotator
from app.core.groq_rotator import groq_rotator
from app.core.config import settings

logger = logging.getLogger("orchestrator")

class AgentOrchestrator:
    """
    Coordinates end-to-end multi-step reasoning:
    0. Multimodal Visual Perception (Gemini Flash Vision)
    1. Deterministic Intent & Plan DAG Generation
    2. Parallel Sectors REST API Tool Execution (with persistent caching)
    3. Deterministic Financial Ratio & Peer Matrix Computation
    4. Bahasa Indonesia Synthesis with Groq (120b)
    """

    SEMANTIC_ROUTER_SYSTEM = (
        "Anda adalah Autonomous Intent & Tool Routing Arbiter untuk AlphaSector (Autonomous Equity Research Agent di Bursa Efek Indonesia/IDX).\n\n"
        "TUGAS UTAMA:\n"
        "1. Evaluasi apakah pertanyaan user MEMBUTUHKAN KLARIFIKASI (needs_clarification: true) karena kueri terlalu luas, ambigu, atau underspecified.\n"
        "2. Jika kueri sudah jelas, klasifikasikan apakah membutuhkan LIVE DATA TOOLS (requires_live_tools: true) atau CUKUP CONVERSATIONAL SYNTHESIS (requires_live_tools: false).\n\n"
        "OUTPUT HARUS FORMAT JSON MURNI:\n"
        "{\n"
        '  "requires_live_tools": true | false,\n'
        '  "needs_clarification": true | false,\n'
        '  "clarification": {\n'
        '    "question": "Pertanyaan spesifik dalam Bahasa Indonesia untuk mengunci fokus riset",\n'
        '    "options": [\n'
        '      {"id": "opt_1", "label": "Label Opsi Singkat", "description": "Penjelasan lingkup analisis", "suggested_query": "Query terarah spesifik"},\n'
        '      {"id": "opt_2", "label": "Label Opsi Singkat", "description": "Penjelasan lingkup analisis", "suggested_query": "Query terarah spesifik"},\n'
        '      {"id": "opt_3", "label": "Label Opsi Singkat", "description": "Penjelasan lingkup analisis", "suggested_query": "Query terarah spesifik"}\n'
        '    ],\n'
        '    "context_topic": "Topik Singkat (misal: Komparasi BBCA vs BMRI)"\n'
        '  } | null,\n'
        '  "intent": "PEER_BATTLE_COMPARISON" | "SINGLE_TICKER_DEEP_DIVE" | "MARKET_SCREENING_DISCOVERY" | "INSIDER_FORENSIC_RADAR" | "INSTITUTIONAL_OWNERSHIP" | "REGULATORY_SUSPENSION_RADAR" | "SMART_MONEY_RADAR" | "COMMODITY_MACRO_IMPACT" | "GENERAL_FINANCIAL_QUERY" | "CLARIFICATION_REQUIRED",\n'
        '  "target_tickers": ["TICKER1", "TICKER2"],\n'
        '  "resolved_context_ticker": "TICKER" | null,\n'
        '  "reasoning": "Alasan ringkas 1 kalimat"\n'
        "}\n\n"
        "ATURAN DETEKSI KLARIFIKASI (needs_clarification):\n"
        "- needs_clarification = TRUE jika:\n"
        "  a. Komparasi 2 emiten tanpa kriteria/tujuan spesifik (contoh: 'bagusan mana BBCA atau BMRI', 'pilih ASII atau UNTR'). Berikan opsi pilihan: (1) Valuasi & Dividen, (2) Smart Money & Broker Flow, (3) Audit Forensik Komprehensif.\n"
        "  b. Kueri sektor luas tanpa emiten spesifik (contoh: 'analisis sektor energi', 'saham bank apa yang bagus'). Berikan opsi emiten top pick atau kriteria rasio.\n"
        "  c. Kueri rekomendasi tanpa kriteria/horizon (contoh: 'rekomendasi saham hari ini', 'saham apa yang mau naik'). Berikan opsi strategi: Value Investing, Dividend Hunter, Momentum/Swing Flow.\n"
        "  d. Kueri 1-2 kata yang sangat underspecified (contoh: 'gimana TLKM', 'analisis BUMI').\n"
        "- needs_clarification = FALSE jika kueri sudah memiliki indikator atau tujuan jelas (contoh: 'siapa top buyer BBCA hari ini', 'berapa PE dan PBV BMRI', 'apakah ada suspensi bursa saham tambang', atau follow-up atas chat sebelumnya).\n\n"
        "ATURAN LIVE TOOLS:\n"
        "- requires_live_tools = TRUE jika user menanyakan evaluasi baru atas data bursa.\n"
        "- requires_live_tools = FALSE jika user HANYA meminta format ulang data dari chat sebelumnya (tabel, ringkas, opini atas konteks yang sudah ada) atau edukasi konsep."
    )

    async def _semantic_route(
        self,
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        context_ticker: Optional[str] = None
    ) -> Dict[str, Any]:
        """Classify user intent using LLM Semantic Router with automatic fallback to heuristics."""
        if groq_rotator.has_keys():
            messages = [{"role": "system", "content": self.SEMANTIC_ROUTER_SYSTEM}]
            if conversation_history:
                for turn in conversation_history[-4:]:
                    content = turn.get("content", "")
                    if content:
                        messages.append({"role": turn.get("role", "user"), "content": content[:300]})
            messages.append({"role": "user", "content": query})

            try:
                raw_res = await groq_rotator.generate_chat_completion(
                    messages=messages,
                    model=settings.GROQ_MODEL,
                    temperature=0.0,
                    max_tokens=512
                )
                clean_json = raw_res.strip()
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_json:
                    clean_json = clean_json.split("```")[1].split("```")[0].strip()

                parsed = json.loads(clean_json)
                intent_str = parsed.get("intent", "GENERAL_FINANCIAL_QUERY")
                needs_clarification = bool(parsed.get("needs_clarification", False))
                clarification_data = parsed.get("clarification") if needs_clarification else None

                if needs_clarification and clarification_data:
                    intent_enum = AgentIntent.CLARIFICATION_REQUIRED
                else:
                    try:
                        intent_enum = AgentIntent(intent_str)
                    except ValueError:
                        intent_enum = AgentIntent.GENERAL_FINANCIAL_QUERY

                tickers = parsed.get("target_tickers", [])
                if not tickers and parsed.get("resolved_context_ticker"):
                    tickers = [parsed["resolved_context_ticker"]]

                return {
                    "requires_live_tools": bool(parsed.get("requires_live_tools", True)),
                    "needs_clarification": needs_clarification,
                    "clarification": clarification_data,
                    "intent": intent_enum,
                    "target_tickers": tickers,
                    "reasoning": parsed.get("reasoning", "")
                }
            except Exception as err:
                logger.warning(f"Semantic router fallback to heuristic due to: {err}")

        # Fallback to heuristic
        detected_tickers = planner.parse_tickers(query, context_ticker)
        query_lower = query.lower().strip()
        screening_verbs = ["screen", "screener", "filter", "cari saham", "temukan saham", "top saham", "saham terbaik", "saham dividen"]
        is_screening = any(v in query_lower for v in screening_verbs)
        is_commodity = any(k in query_lower for k in ["komoditas", "minyak", "emas", "batubara", "nikel", "tembaga", "cpo", "timah", "gas"])
        is_insider = any(k in query_lower for k in ["insider", "orang dalam", "direksi", "komisaris", "filing", "filings"])
        is_institutional = any(k in query_lower for k in ["dapen", "dana pensiun", "reksadana", "mutual fund", "asuransi", "ksei"])
        is_suspension = any(k in query_lower for k in ["suspensi", "suspension", "gembok", "uma", "unusual market activity"])
        
        has_analytical = (
            len(detected_tickers) > 0 or 
            is_screening or 
            is_commodity or 
            is_insider or 
            is_institutional or 
            is_suspension
        )
        conversational_markers = [
            "buatkan tabel", "tabel ringkas", "tabel perbandingan", "tabel pros", "pros", "cons",
            "kelebihan", "kekurangan", "alokasi", "simulasi", "rangkum", "ringkas", "kesimpulan",
            "saran", "rekomendasi alokasi", "tersebut", "tadi", "di atas", "keduanya", "semuanya",
            "apa itu", "arti dari"
        ]
        is_conv_marker = any(m in query_lower for m in conversational_markers)

        if conversation_history and not has_analytical and is_conv_marker:
            return {
                "requires_live_tools": False,
                "needs_clarification": False,
                "clarification": None,
                "intent": AgentIntent.GENERAL_FINANCIAL_QUERY,
                "target_tickers": [],
                "reasoning": "Heuristic fallback: conversational synthesis over existing context"
            }

        intent, fallback_tickers, _ = planner.classify_and_plan(query, context_ticker)
        return {
            "requires_live_tools": True,
            "needs_clarification": False,
            "clarification": None,
            "intent": intent,
            "target_tickers": fallback_tickers,
            "reasoning": "Heuristic fallback: active market research"
        }

    async def execute(
        self, 
        query: str, 
        context_ticker: Optional[str] = None, 
        session_id: Optional[str] = None,
        custom_api_key: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        image_base64: Optional[str] = None,
        image_mime_type: Optional[str] = None,
        on_step: Optional[Callable[[ReasoningStep, int], Awaitable[None]]] = None
    ) -> AgentQueryResponse:
        start_time = time.time()
        trace: List[ReasoningStep] = []
        step_counter = 1
        credits_used = 0
        visual_context: Optional[str] = None
        total_steps_estimate = 4

        async def record_step(step: ReasoningStep, current_total: Optional[int] = None):
            nonlocal total_steps_estimate
            if current_total is not None:
                total_steps_estimate = current_total
            effective_total = max(total_steps_estimate, step.step_number)
            trace.append(step)
            if on_step:
                try:
                    await on_step(step, effective_total)
                except Exception as step_err:
                    print(f"[Warning] on_step callback failed: {step_err}")

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
                    related_img_tickers = vision_res.get("related_tickers", [])
                    if detected_img_ticker:
                        context_ticker = detected_img_ticker

                    detail_msg = f"Extracted visual chart/report intelligence via {vision_res.get('model', 'gemini-2.5-flash')}"
                    if detected_img_ticker:
                        detail_msg += f" | Identified Ticker: {detected_img_ticker}"
                    if related_img_tickers:
                        detail_msg += f" (Peers: {', '.join(related_img_tickers)})"

                    step = ReasoningStep(
                        id=f"step-{step_counter}",
                        step_number=step_counter,
                        phase=ExecutionPhase.FETCHING,
                        title="Multimodal Financial Vision Perception",
                        detail=detail_msg,
                        timestamp=datetime.now().strftime("%H:%M:%S")
                    )
                    await record_step(step, 5)
                    step_counter += 1
            except Exception as vision_err:
                print(f"[Warning] Gemini vision analysis failed: {vision_err}")
                step = ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.ERROR,
                    title="Multimodal Vision Warning",
                    detail=f"Could not parse image context: {vision_err}",
                    timestamp=datetime.now().strftime("%H:%M:%S")
                )
                await record_step(step, 5)
                step_counter += 1

        # Enrich query with visual context if available
        effective_query = query
        if visual_context:
            effective_query = f"{query}\n\n[KONTEKS OBSERVASI VISUAL DARI GAMBAR TERLAMPIR (GEMINI FLASH VISION)]:\n{visual_context}"

        # -------------------------------------------------------------
        # 0. SEMANTIC INTENT ROUTING & ARBITER
        # -------------------------------------------------------------
        route = await self._semantic_route(query, conversation_history, context_ticker)

        # 0a. CLARIFICATION GATE: Intercept ambiguous/underspecified queries early
        if route.get("needs_clarification") and route.get("clarification"):
            clarify_data = route["clarification"]
            q_step = ReasoningStep(
                id=f"step-{step_counter}",
                step_number=step_counter,
                phase=ExecutionPhase.PLANNING,
                title="Identifikasi Ruang Lingkup Riset (Clarification Gate)",
                detail="Mendeteksi kueri bernilai strategis luas. Mengajukan opsi fokus riset agar analisis akurat dan tepat sasaran.",
                timestamp=datetime.now().strftime("%H:%M:%S")
            )
            await record_step(q_step, 1)

            total_time = int((time.time() - start_time) * 1000)
            target_tickers = route.get("target_tickers", [])
            primary_ticker = target_tickers[0] if target_tickers else context_ticker

            raw_options = clarify_data.get("options", [])
            parsed_options = [
                ClarificationOption(
                    id=opt.get("id", f"opt_{i+1}"),
                    label=opt.get("label", f"Opsi #{i+1}"),
                    description=opt.get("description"),
                    suggested_query=opt.get("suggested_query")
                )
                for i, opt in enumerate(raw_options)
            ]

            clarification_payload = ClarificationPayload(
                question=clarify_data.get("question", "Silakan pilih fokus riset yang ingin diprioritaskan:"),
                options=parsed_options,
                allow_custom_input=True,
                context_topic=clarify_data.get("context_topic")
            )

            return AgentQueryResponse(
                query=query,
                intent=AgentIntent.CLARIFICATION_REQUIRED,
                session_id=session_id,
                primary_ticker=primary_ticker,
                comparison_tickers=target_tickers,
                reasoning_trace=trace,
                synthesis=SynthesisResult(
                    executive_summary=clarification_payload.question,
                    key_findings=[opt.label for opt in parsed_options],
                    disclaimer="AlphaSector Research Terminal • Membutuhkan klarifikasi lingkup riset sebelum eksekusi."
                ),
                clarification=clarification_payload,
                total_execution_time_ms=total_time,
                credits_consumed=0
            )

        if not route["requires_live_tools"]:
            conv_step = ReasoningStep(
                id=f"step-{step_counter}",
                step_number=step_counter,
                phase=ExecutionPhase.SYNTHESIZING,
                title="Conversational Financial Reasoning",
                detail=route.get("reasoning") or "Formulating direct structured response based on active multi-turn research context",
                timestamp=datetime.now().strftime("%H:%M:%S")
            )
            await record_step(conv_step, 1)
            synthesis_result = await AgentSynthesizer.synthesize_conversational(
                query=effective_query,
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
        # 1. PLANNING PHASE (Semantic-Driven DAG Execution)
        # -------------------------------------------------------------
        intent = route["intent"]
        tickers = route["target_tickers"]
        planned_steps = planner.build_steps_for_intent(intent, tickers, query, context_ticker)
        
        target_label = ", ".join(tickers) if tickers else "Market-Wide"

        # Dynamically calculate exact total steps for real-time live execution
        has_enrich = (intent == AgentIntent.MARKET_SCREENING_DISCOVERY)
        has_math = (intent != AgentIntent.REGULATORY_SUSPENSION_RADAR)
        has_broker_analysis = any(s.get("action") == "FETCH_BROKER_SUMMARY" for s in planned_steps)
        calculated_total = 1 + len(planned_steps) + (1 if has_enrich else 0) + (1 if has_math else 0) + (1 if has_broker_analysis else 0) + 1

        plan_step = ReasoningStep(
            id=f"step-{step_counter}",
            step_number=step_counter,
            phase=ExecutionPhase.PLANNING,
            title="Intent Classification & Plan Generation",
            detail=f"Intent: {intent.value} | Target Tickers: {target_label} | Planned Steps: {len(planned_steps)}",
            timestamp=datetime.now().strftime("%H:%M:%S")
        )
        await record_step(plan_step, calculated_total)
        step_counter += 1

        # -------------------------------------------------------------
        # 2. FETCHING PHASE (Parallel Tool Execution)
        # -------------------------------------------------------------
        reports: List[Dict[str, Any]] = []
        broker_summaries: Dict[str, Any] = {}
        foreign_flows: Dict[str, Any] = {}
        screener_data: Optional[Any] = None
        segments_data: Dict[str, Any] = {}
        insider_filings_data: Dict[str, Any] = {}
        shareholders_data: Dict[str, Any] = {}
        suspensions_data: Optional[Any] = None

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
            elif action == "FETCH_INSIDER_FILINGS":
                t = step.get("ticker") or (tickers[0] if tickers else context_ticker)
                data, log = await tool_executor.fetch_insider_filings(symbol=t, limit=15, api_key=custom_api_key)
                return ("INSIDER", t, data, log)
            elif action == "FETCH_SHAREHOLDERS_COMPOSITION":
                t = step.get("ticker") or (tickers[0] if tickers else context_ticker) or "BBCA"
                data, log = await tool_executor.fetch_shareholders_composition(t, api_key=custom_api_key)
                return ("SHAREHOLDERS", t, data, log)
            elif action == "FETCH_SUSPENSIONS":
                t = step.get("ticker") or (tickers[0] if tickers else context_ticker)
                data, log = await tool_executor.fetch_suspensions(symbol=t, limit=20, api_key=custom_api_key)
                return ("SUSPENSIONS", t or "MARKET", data, log)
            elif action in ("SCREEN_MARKET", "RUN_SCREENER"):
                q_text = step.get("query", query)
                data, log = await tool_executor.screen_market(q_text, api_key=custom_api_key)
                return ("SCREENER", "SCREENER", data, log)
            elif action == "FETCH_TOP_MOVERS":
                data, log = await tool_executor.fetch_top_movers(api_key=custom_api_key)
                return ("TOP_MOVERS", "TOP_MOVERS", data, log)
            elif action == "FETCH_MINING_PERFORMANCE":
                t = step.get("ticker") or (tickers[0] if tickers else context_ticker) or "INCO"
                data, log = await tool_executor.fetch_mining_performance(t, api_key=custom_api_key)
                return ("MINING", t, data, log)
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
                step = ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Company Report ({sym})",
                    detail=f"Retrieved fundamental overview, valuation multiples, and financials for {sym} in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                )
                await record_step(step)
                step_counter += 1

            elif kind == "BROKER":
                if data: broker_summaries[sym] = data
                step = ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Broker Summary ({sym})",
                    detail=f"Retrieved top accumulating & distributing brokers for {sym} in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                )
                await record_step(step)
                step_counter += 1

            elif kind == "FOREIGN":
                if data: foreign_flows[sym] = data
                step = ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Net Foreign Flow ({sym})",
                    detail=f"Retrieved historical net foreign broker inflow for {sym}",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                )
                await record_step(step)
                step_counter += 1

            elif kind == "SEGMENTS":
                if data: segments_data[sym] = data
                step = ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Revenue Segments ({sym})",
                    detail=f"Retrieved business revenue & cost breakdown for {sym}",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                )
                await record_step(step)
                step_counter += 1

            elif kind == "SCREENER":
                screener_data = data
                raw_items = []
                if isinstance(data, dict):
                    raw_items = data.get("results") or data.get("data") or data.get("companies") or []
                elif isinstance(data, list):
                    raw_items = data
                emiten_count = len(raw_items) if isinstance(raw_items, list) else 1
                step = ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title="Screen Companies Universe",
                    detail=f"Screened IDX universe matching criteria ({emiten_count} emitens retrieved) in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                )
                await record_step(step)
                step_counter += 1

            elif kind == "TOP_MOVERS":
                step = ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title="Fetch Top Movers & Market Momentum",
                    detail=f"Retrieved 7-day gainers/losers leaderboard in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                )
                await record_step(step)
                step_counter += 1

            elif kind == "TOP_BROKERS":
                step = ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title="Fetch Institutional Broker Leaders",
                    detail=f"Retrieved institutional transaction volume ranking in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                )
                await record_step(step)
                step_counter += 1

            elif kind == "INSIDER":
                if data: insider_filings_data[sym or "MARKET"] = data
                raw_filings = data.get("results") if isinstance(data, dict) else data
                count = len(raw_filings) if isinstance(raw_filings, list) else 0
                step = ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Insider Filings ({sym or 'BEI'})",
                    detail=f"Retrieved {count} official director/commissioner transaction filings from BEI/KSEI in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                )
                await record_step(step)
                step_counter += 1

            elif kind == "SHAREHOLDERS":
                if data: shareholders_data[sym] = data
                step = ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Institutional Ownership Breakdown ({sym})",
                    detail=f"Retrieved KSEI registry breakdown (Dapen, Reksadana, Asuransi, Ritel) in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                )
                await record_step(step)
                step_counter += 1

            elif kind == "SUSPENSIONS":
                suspensions_data = data
                raw_sus = data.get("results") if isinstance(data, dict) else data
                count = len(raw_sus) if isinstance(raw_sus, list) else 0
                step = ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch BEI Suspension Radar & UMA Notices ({sym})",
                    detail=f"Retrieved {count} regulatory suspension records & official exchange letters in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                )
                await record_step(step)
                step_counter += 1

            elif kind == "MINING":
                step = ReasoningStep(
                    id=f"step-{step_counter}",
                    step_number=step_counter,
                    phase=ExecutionPhase.FETCHING,
                    title=f"Fetch Mining Performance & Sites ({sym})",
                    detail=f"Retrieved operational mining metrics, reserves, and production sites in {log.latency_ms}ms",
                    tool_call=log,
                    timestamp=datetime.now().strftime("%H:%M:%S")
                )
                await record_step(step)
                step_counter += 1

        # Extract clean list of screener items
        screener_items = []
        if isinstance(screener_data, dict):
            raw_s = screener_data.get("results") or screener_data.get("data") or screener_data.get("companies") or []
            screener_items = raw_s if isinstance(raw_s, list) else []
        elif isinstance(screener_data, list):
            screener_items = screener_data

        # Auto-enrich screener results: concurrently fetch full fundamental reports for top 4 screened emitens
        if screener_items and not reports:
            top_screener_tickers = []
            for item in screener_items:
                if isinstance(item, dict):
                    sym = item.get("symbol", "").replace(".JK", "").upper().strip()
                    if sym and sym not in top_screener_tickers and len(sym) == 4:
                        top_screener_tickers.append(sym)
                if len(top_screener_tickers) >= 4:
                    break

            if top_screener_tickers:
                enrich_results = await asyncio.gather(*[
                    tool_executor.fetch_company_report(t, api_key=custom_api_key)
                    for t in top_screener_tickers
                ])
                for r_data, r_log in enrich_results:
                    if r_data:
                        reports.append(r_data)
                        credits_used += 1

                if reports:
                    tickers = [
                        r.get("overview", {}).get("symbol", "").replace(".JK", "").upper()
                        for r in reports if r.get("overview", {}).get("symbol")
                    ]
                    step = ReasoningStep(
                        id=f"step-{step_counter}",
                        step_number=step_counter,
                        phase=ExecutionPhase.FETCHING,
                        title="Auto-Enrich Top Screened Emitens",
                        detail=f"Retrieved fundamental valuation, financial ratios, and multiples for top {len(reports)} screened picks ({', '.join(tickers)})",
                        timestamp=datetime.now().strftime("%H:%M:%S")
                    )
                    await record_step(step)
                    step_counter += 1

        # -------------------------------------------------------------
        # 3. COMPARISON & RATIO ENGINE (Deterministic Math)
        # -------------------------------------------------------------
        peer_matrix = None
        analyzed_broker = None

        if reports:
            peer_matrix = comparator.build_peer_matrix(reports)

            # Map screener criteria values to tags in peer_matrix if available
            if screener_items:
                screener_map = {}
                for item in screener_items:
                    if isinstance(item, dict):
                        s = item.get("symbol", "").replace(".JK", "").upper().strip()
                        if s:
                            screener_map[s] = item

                for p in peer_matrix:
                    sym = p.get("symbol")
                    if sym in screener_map:
                        sc_item = screener_map[sym]
                        qv = sc_item.get("query_values") or {}
                        existing_tags = p.get("tags") or []
                        new_tags = list(existing_tags)
                        if "esg_score" in qv:
                            new_tags.append(f"ESG Score: {qv['esg_score']}")
                        elif "(earnings[2025]/employee_num)" in qv:
                            val = qv["(earnings[2025]/employee_num)"]
                            val_m = round(val / 1_000_000_000, 1) if val > 1_000_000_000 else round(val / 1_000_000, 1)
                            new_tags.append(f"Laba/Karyawan: Rp {val_m} M")
                        elif "employee_num" in qv and "earnings[2025]" in qv:
                            val = qv["earnings[2025]"] / max(qv["employee_num"], 1)
                            val_m = round(val / 1_000_000_000, 1)
                            new_tags.append(f"Laba/Karyawan: Rp {val_m} M")
                        elif "revenue_growth_yoy" in qv:
                            new_tags.append(f"YoY Growth: +{qv['revenue_growth_yoy']}%")
                        elif "major_shareholder_pct" in qv:
                            new_tags.append(f"Major Owner: {qv['major_shareholder_pct']}%")
                        else:
                            for k, v in qv.items():
                                if isinstance(v, (int, float)) and not k.startswith("("):
                                    clean_k = k.replace("_", " ").title()
                                    new_tags.append(f"{clean_k}: {v}")
                                    break
                        p["tags"] = new_tags

            step = ReasoningStep(
                id=f"step-{step_counter}",
                step_number=step_counter,
                phase=ExecutionPhase.COMPARING,
                title="Deterministic Financial Intelligence Engine",
                detail=f"Computed Piotroski F-Score (0-9), Historical P/E Standard Deviation Bands, and Best-in-Class metrics across {len(peer_matrix)} emitens",
                timestamp=datetime.now().strftime("%H:%M:%S")
            )
            await record_step(step)
            step_counter += 1
        elif screener_items and len(screener_items) > 0:
            # Construct peer matrix from screened companies if reports enrichment unavailable
            peer_matrix = []
            extracted_tickers = []
            for item in screener_items[:6]:
                if isinstance(item, dict):
                    sym = item.get("symbol", "").replace(".JK", "").upper().strip()
                    if sym:
                        extracted_tickers.append(sym)
                    qv = item.get("query_values") or {}
                    tag_list = []
                    if "esg_score" in qv:
                        tag_list.append(f"ESG Score: {qv['esg_score']}")
                    elif "(earnings[2025]/employee_num)" in qv:
                        val = qv["(earnings[2025]/employee_num)"]
                        val_m = round(val / 1_000_000_000, 1) if val > 1_000_000_000 else round(val / 1_000_000, 1)
                        tag_list.append(f"Laba/Karyawan: Rp {val_m} M")
                    elif item.get("esg_score"):
                        tag_list.append(f"ESG: {item['esg_score']}")
                    elif item.get("revenue_growth_yoy"):
                        tag_list.append(f"YoY Growth: +{item['revenue_growth_yoy']}%")
                    elif item.get("major_shareholder_pct"):
                        tag_list.append(f"Major Owner: {item['major_shareholder_pct']}%")

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
                        "tags": tag_list
                    })
            if not tickers and extracted_tickers:
                tickers = extracted_tickers
            step = ReasoningStep(
                id=f"step-{step_counter}",
                step_number=step_counter,
                phase=ExecutionPhase.COMPARING,
                title="Screened Peer Universe Ranking & Multiples",
                detail=f"Assembled fundamental multiples, valuations, and criteria metrics across {len(peer_matrix)} screened emitens",
                timestamp=datetime.now().strftime("%H:%M:%S")
            )
            await record_step(step)
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
            step = ReasoningStep(
                id=f"step-{step_counter}",
                step_number=step_counter,
                phase=ExecutionPhase.COMPARING,
                title=f"Smart Money Concentration Analysis ({primary_ticker})",
                detail=f"Classified broker flow as {analyzed_broker.get('sentiment', 'NEUTRAL')} with {analyzed_broker.get('buyer_concentration', 0)}% buyer concentration",
                timestamp=datetime.now().strftime("%H:%M:%S")
            )
            await record_step(step)
            step_counter += 1
        elif broker_summaries:
            first_valid_broker = next((sym for sym in broker_summaries if broker_summaries[sym]), None)
            if first_valid_broker:
                analyzed_broker = comparator.analyze_broker_sentiment(broker_summaries[first_valid_broker])

        # -------------------------------------------------------------
        # 4. SYNTHESIS PHASE (LLM Structured Report Generation)
        # -------------------------------------------------------------
        synth_step = ReasoningStep(
            id=f"step-{step_counter}",
            step_number=step_counter,
            phase=ExecutionPhase.SYNTHESIZING,
            title="Institutional Autonomous Synthesis",
            detail=f"Synthesizing {target_label} intelligence, valuation verdict, and risk considerations...",
            timestamp=datetime.now().strftime("%H:%M:%S")
        )
        await record_step(synth_step)
        step_counter += 1

        synthesis_result: SynthesisResult = await AgentSynthesizer.synthesize(
            query=effective_query,
            intent=intent,
            tickers=tickers,
            reports=reports,
            peer_matrix=peer_matrix,
            broker_summary=analyzed_broker,
            screener_data={"results": screener_items} if screener_items else None,
            insider_filings=insider_filings_data,
            shareholders_data=shareholders_data,
            suspensions_data=suspensions_data
        )

        total_ms = int((time.time() - start_time) * 1000)

        # Clean comparison_tickers from peer_matrix
        valid_comp_tickers = []
        if peer_matrix:
            valid_comp_tickers = [p.get("symbol") for p in peer_matrix if p.get("symbol") and p.get("symbol") != primary_ticker]
        elif tickers and len(tickers) > 1:
            valid_comp_tickers = [t for t in tickers if t != primary_ticker]

        # Strict separation by intent to ensure signature layouts are pristine and free of cross-contamination:
        metrics_summary = None
        effective_peer_matrix = None
        broker_info = None

        if analyzed_broker:
            broker_info = {
                "sentiment": analyzed_broker.get("sentiment", "NEUTRAL"),
                "net_foreign_flow_status": analyzed_broker.get("net_foreign_flow_status", "NEUTRAL"),
                "top_buyers": analyzed_broker.get("top_buyers", []),
                "top_sellers": analyzed_broker.get("top_sellers", []),
                "buyer_concentration": analyzed_broker.get("buyer_concentration", 0)
            }

        if intent == AgentIntent.PEER_BATTLE_COMPARISON:
            effective_peer_matrix = peer_matrix if (peer_matrix and len(peer_matrix) > 1) else peer_matrix
            broker_info = None
            metrics_summary = None
        elif intent == AgentIntent.SMART_MONEY_RADAR:
            effective_peer_matrix = None
            metrics_summary = None
        elif intent == AgentIntent.MARKET_SCREENING_DISCOVERY:
            effective_peer_matrix = peer_matrix
            broker_info = None
            metrics_summary = None
        elif intent in (AgentIntent.SINGLE_TICKER_DEEP_DIVE, AgentIntent.COMPANY_DEEP_DIVE):
            if peer_matrix and len(peer_matrix) > 0:
                metrics_summary = peer_matrix[0]
            effective_peer_matrix = None
        elif intent in (AgentIntent.INSTITUTIONAL_OWNERSHIP, AgentIntent.INSIDER_FORENSIC_RADAR):
            # Retain company overview for ticker context, and broker flow if relevant
            if peer_matrix and len(peer_matrix) > 0:
                metrics_summary = peer_matrix[0]
            effective_peer_matrix = None
        elif intent == AgentIntent.REGULATORY_SUSPENSION_RADAR:
            if primary_ticker and peer_matrix and len(peer_matrix) > 0:
                metrics_summary = peer_matrix[0]
            effective_peer_matrix = None
            broker_info = None
        else: # GENERAL or fallback
            if peer_matrix and len(peer_matrix) > 1:
                effective_peer_matrix = peer_matrix
            elif peer_matrix and len(peer_matrix) == 1:
                metrics_summary = peer_matrix[0]

        # Clean forensic payloads for frontend visualization
        clean_insider_filings = None
        if insider_filings_data:
            first_key = next(iter(insider_filings_data))
            raw_f = insider_filings_data[first_key]
            if isinstance(raw_f, dict) and "results" in raw_f:
                clean_insider_filings = raw_f["results"]
            elif isinstance(raw_f, list):
                clean_insider_filings = raw_f

        clean_shareholders_summary = None
        if shareholders_data:
            first_key = next(iter(shareholders_data))
            clean_shareholders_summary = shareholders_data[first_key]

        clean_suspensions = None
        if suspensions_data:
            if isinstance(suspensions_data, dict) and "results" in suspensions_data:
                clean_suspensions = suspensions_data["results"]
            elif isinstance(suspensions_data, list):
                clean_suspensions = suspensions_data

        return AgentQueryResponse(
            query=query,
            intent=intent,
            session_id=session_id,
            primary_ticker=primary_ticker,
            comparison_tickers=valid_comp_tickers,
            reasoning_trace=trace,
            metrics_summary=metrics_summary,
            peer_matrix=effective_peer_matrix,
            broker_summary=broker_info,
            insider_filings=clean_insider_filings,
            shareholders_summary=clean_shareholders_summary,
            suspensions_data=clean_suspensions,
            synthesis=synthesis_result,
            visual_context=visual_context,
            suggested_followups=synthesis_result.suggested_followups if synthesis_result else [],
            total_execution_time_ms=total_ms,
            credits_consumed=credits_used
        )


agent_orchestrator = AgentOrchestrator()
