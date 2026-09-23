import asyncio
import json
import logging
from typing import Dict, Any, List, Optional, Tuple, Callable, Awaitable
from datetime import datetime

from app.core.config import settings
from app.core.groq_rotator import groq_rotator
from app.schemas.agent import (
    PillarScorecard,
    ContradictionAlert,
    CompositeDossierPayload,
    ReasoningStep,
    ExecutionPhase,
)
from app.agent.comparator import comparator

logger = logging.getLogger("multi_agent_harness")


class MultiAgentHarness:
    """
    Groq Sub-Agent Harness for High-Speed Distributed Equity Research.
    Orchestrates 3 specialized sub-agents running concurrently via Groq (llama-3.1-8b-instant),
    followed by a Lead Arbiter reasoning pass to detect market contradictions and synthesize
    a Composite Stock Dossier.
    """

    SUBAGENT_MODEL = settings.GROQ_SUBAGENT_MODEL
    ARBITER_MODEL = settings.GROQ_MODEL

    # =========================================================================
    # SUB-AGENT 1: FUNDAMENTAL & VALUATION SPECIALIST
    # =========================================================================
    @classmethod
    async def run_fundamental_agent(
        cls,
        ticker: str,
        report_data: Optional[Dict[str, Any]],
        peer_item: Optional[Dict[str, Any]]
    ) -> PillarScorecard:
        """Evaluates valuation multiples, balance sheet strength, and profitability."""
        overview = (report_data or {}).get("overview", {})
        valuation = (report_data or {}).get("valuation", {})
        financials = (report_data or {}).get("financials", {})

        pe = peer_item.get("pe") if peer_item else valuation.get("pe") or overview.get("pe")
        pbv = peer_item.get("pbv") if peer_item else valuation.get("pbv") or overview.get("pbv")
        roe = peer_item.get("roe") if peer_item else financials.get("roe") or overview.get("roe")
        npm = peer_item.get("npm") if peer_item else financials.get("npm") or overview.get("net_profit_margin")
        der = peer_item.get("der") if peer_item else financials.get("der")
        piotroski = peer_item.get("piotroski_score") if peer_item else 6
        pe_status = peer_item.get("pe_historical_status") if peer_item else "FAIR"

        prompt = (
            f"Anda adalah Sub-Agent Spesialis Analisis Fundamental & Valuasi Saham IDX untuk emiten {ticker}.\n"
            f"DATA EMITEN:\n"
            f"- Ticker: {ticker}\n"
            f"- PE Ratio: {pe} (Status Historis: {pe_status})\n"
            f"- PBV Ratio: {pbv}\n"
            f"- ROE: {roe}%\n"
            f"- Net Profit Margin: {npm}%\n"
            f"- DER: {der}\n"
            f"- Piotroski F-Score: {piotroski}/9\n\n"
            "TUGAS:\n"
            "1. Tentukan Skor Fundamental dari 1 (sangat rapuh/sangat mahal) hingga 10 (sangat sehat/undervalued prima).\n"
            "2. Tentukan Stance: 'UNDERVALUED', 'FAIR_VALUE', 'OVERVALUED', atau 'VALUE_TRAP'.\n"
            "3. Buat Verdict tajam 1-2 kalimat dalam Bahasa Indonesia profesional.\n"
            "4. Buat 3 poin utama (key_points) yang memuat metrik angka riil di atas.\n\n"
            "OUTPUT FORMAT JSON MURNI:\n"
            "{\n"
            '  "score": 8,\n'
            '  "stance": "UNDERVALUED",\n'
            '  "verdict": "Kalimat verdict...",\n'
            '  "key_points": ["Poin 1 dengan data", "Poin 2 dengan data", "Poin 3 dengan data"]\n'
            "}"
        )

        messages = [
            {"role": "system", "content": "You are an institutional fundamental valuation specialist. Output strictly valid JSON."},
            {"role": "user", "content": prompt}
        ]

        if groq_rotator.has_keys():
            try:
                raw_res = await groq_rotator.generate_chat_completion(
                    messages=messages,
                    model=cls.SUBAGENT_MODEL,
                    temperature=0.1,
                    max_tokens=512,
                    response_format={"type": "json_object"}
                )
                clean_json = raw_res.strip()
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_json:
                    clean_json = clean_json.split("```")[1].split("```")[0].strip()

                parsed = json.loads(clean_json)
                return PillarScorecard(
                    pillar="FUNDAMENTAL",
                    title="Fundamental & Valuasi",
                    stance=parsed.get("stance", "FAIR_VALUE").upper(),
                    score=max(1, min(10, int(parsed.get("score", 7)))),
                    verdict=parsed.get("verdict", f"Kondisi fundamental {ticker} menunjukkan stabilitas rasio keuangan."),
                    key_points=parsed.get("key_points", [
                        f"P/E Ratio berada pada level {pe or 'N/A'}x ({pe_status})",
                        f"Tingkat pengembalian ekuitas (ROE) tercatat {roe or 'N/A'}%",
                        f"Piotroski F-Score mencapai {piotroski}/9 mencerminkan ketahanan solvabilitas"
                    ])[:3]
                )
            except Exception as err:
                logger.warning(f"Fundamental sub-agent failed ({err}), falling back to heuristics")

        # Deterministic fallback
        score = 6
        stance = "FAIR_VALUE"
        if isinstance(roe, (int, float)) and roe > 15 and isinstance(pe, (int, float)) and pe < 12:
            score = 9
            stance = "UNDERVALUED"
        elif isinstance(pe, (int, float)) and pe > 30:
            score = 4
            stance = "OVERVALUED"

        return PillarScorecard(
            pillar="FUNDAMENTAL",
            title="Fundamental & Valuasi",
            stance=stance,
            score=score,
            verdict=f"Fundamental {ticker} berada pada valuasi {stance.lower()} didukung ketahanan neraca dan margin laba.",
            key_points=[
                f"Valuasi P/E tercatat {pe or 'N/A'}x dengan PBV {pbv or 'N/A'}x",
                f"Kinerja profitabilitas ROE {roe or 'N/A'}% dan Net Profit Margin {npm or 'N/A'}%",
                f"Skor ketahanan modal Piotroski F-Score sebesar {piotroski}/9"
            ]
        )

    # =========================================================================
    # SUB-AGENT 2: SMART MONEY & BROKER FLOW SPECIALIST
    # =========================================================================
    @classmethod
    async def run_smart_money_agent(
        cls,
        ticker: str,
        broker_summary_data: Optional[Dict[str, Any]],
        foreign_flow_data: Optional[Dict[str, Any]]
    ) -> PillarScorecard:
        """Evaluates top broker concentration, accumulation/distribution, and institutional flow."""
        analyzed = comparator.analyze_broker_sentiment(broker_summary_data) if broker_summary_data else {}
        sentiment = analyzed.get("sentiment", "NEUTRAL")
        buyer_conc = analyzed.get("buyer_concentration", 50)
        def get_val(b: Any) -> float:
            if not isinstance(b, dict):
                return 0.0
            v = b.get("net_idr") or b.get("net_buy_value") or b.get("net_sell_value") or b.get("buy_idr") or b.get("sell_idr") or b.get("buy_val") or b.get("sell_val") or b.get("val") or 0
            return abs(float(v))

        def format_val_str(v: float) -> str:
            if v >= 1e12:
                return f"Rp {round(v/1e12, 2)} T"
            elif v >= 1e9:
                return f"Rp {round(v/1e9, 1)} M"
            elif v >= 1e6:
                return f"Rp {round(v/1e6, 0)} Jt"
            return "Rp 0"

        top_buyers = [f"{b.get('broker') or b.get('broker_code')} ({format_val_str(get_val(b))})" for b in analyzed.get("top_buyers", [])[:3]]
        top_sellers = [f"{s.get('broker') or s.get('broker_code')} ({format_val_str(get_val(s))})" for s in analyzed.get("top_sellers", [])[:3]]

        # Foreign net flow estimate
        foreign_status = "NET_NEUTRAL"
        if foreign_flow_data:
            flow_list = foreign_flow_data.get("data", []) or foreign_flow_data.get("results", []) or []
            if flow_list and isinstance(flow_list, list):
                last_flow = flow_list[-1] if isinstance(flow_list[-1], dict) else {}
                net_val = last_flow.get("net_foreign") or last_flow.get("foreign_net_val") or 0
                if net_val > 0:
                    foreign_status = f"NET_BUY (+Rp {round(net_val/1e9, 1)}M)"
                elif net_val < 0:
                    foreign_status = f"NET_SELL (-Rp {round(abs(net_val)/1e9, 1)}M)"

        prompt = (
            f"Anda adalah Sub-Agent Spesialis Smart Money & Aliran Bandar (Bandarmology) IDX untuk {ticker}.\n"
            f"DATA TRANSAKSI BROKER:\n"
            f"- Sentiment Arus: {sentiment}\n"
            f"- Konsentrasi Buyer Top 3: {buyer_conc}%\n"
            f"- Top Accumulating Brokers: {', '.join(top_buyers) or 'Tidak ada data signifikan'}\n"
            f"- Top Distributing Brokers: {', '.join(top_sellers) or 'Tidak ada data signifikan'}\n"
            f"- Foreign Flow Status: {foreign_status}\n\n"
            "TUGAS:\n"
            "1. Tentukan Skor Smart Money dari 1 (distribusi bandar brutal/outflow asing) hingga 10 (akumulasi masif/high conviction). Jika posisi Netral atau berimbang, berikan skor 5 atau 6.\n"
            "2. Tentukan Stance: 'HEAVY_ACCUMULATION', 'MODERATE_ACCUMULATION', 'NEUTRAL', 'DISTRIBUTION', atau 'HEAVY_DISTRIBUTION'.\n"
            "3. Buat Verdict tajam 1-2 kalimat dalam Bahasa Indonesia.\n"
            "4. Buat 3 poin utama (key_points) memuat broker dan volume/konsentrasi.\n\n"
            "OUTPUT FORMAT JSON MURNI:\n"
            "{\n"
            '  "score": 6,\n'
            '  "stance": "NEUTRAL",\n'
            '  "verdict": "Kalimat verdict bandar...",\n'
            '  "key_points": ["Poin 1 dengan data broker", "Poin 2", "Poin 3"]\n'
            "}"
        )

        messages = [
            {"role": "system", "content": "You are a specialized institutional IDX broker flow and bandarmology analyst. Output strictly valid JSON."},
            {"role": "user", "content": prompt}
        ]

        if groq_rotator.has_keys():
            try:
                raw_res = await groq_rotator.generate_chat_completion(
                    messages=messages,
                    model=cls.SUBAGENT_MODEL,
                    temperature=0.1,
                    max_tokens=512,
                    response_format={"type": "json_object"}
                )
                clean_json = raw_res.strip()
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_json:
                    clean_json = clean_json.split("```")[1].split("```")[0].strip()

                parsed = json.loads(clean_json)
                return PillarScorecard(
                    pillar="SMART_MONEY",
                    title="Smart Money & Broker Flow",
                    stance=parsed.get("stance", "NEUTRAL").upper(),
                    score=max(1, min(10, int(parsed.get("score", 5)))),
                    verdict=parsed.get("verdict", f"Aliran dana institusional {ticker} menunjukkan dinamika pasar aktif."),
                    key_points=parsed.get("key_points", [
                        f"Konsentrasi akumulasi buyer tercatat sebesar {buyer_conc}%",
                        f"Top akumulator: {', '.join(top_buyers[:2]) or 'Institusi Lokal'}",
                        f"Arah foreign flow berada dalam status {foreign_status}"
                    ])[:3]
                )
            except Exception as err:
                logger.warning(f"Smart money sub-agent failed ({err}), falling back to heuristics")

        # Fallback
        score = 5
        stance = "NEUTRAL"
        if "ACCUMULATION" in sentiment:
            score = 8 if "STRONG" in sentiment else 7
            stance = "HEAVY_ACCUMULATION" if "STRONG" in sentiment else "MODERATE_ACCUMULATION"
        elif "DISTRIBUTION" in sentiment:
            score = 3 if "STRONG" in sentiment else 4
            stance = "HEAVY_DISTRIBUTION" if "STRONG" in sentiment else "DISTRIBUTION"

        return PillarScorecard(
            pillar="SMART_MONEY",
            title="Smart Money & Broker Flow",
            stance=stance,
            score=score,
            verdict=f"Arus dana bandar dan institusi terpantau {stance.lower().replace('_', ' ')} dengan konsentrasi {buyer_conc}%.",
            key_points=[
                f"Konsentrasi buyer top 3 berada pada level {buyer_conc}%",
                f"Arah pergerakan dana asing: {foreign_status}",
                f"Peta akumulasi broker dominan: {', '.join(top_buyers[:2]) or 'Netral'}"
            ]
        )

    # =========================================================================
    # SUB-AGENT 3: GOVERNANCE & REGULATORY SENTINEL
    # =========================================================================
    @classmethod
    async def run_governance_agent(
        cls,
        ticker: str,
        insider_filings: Optional[List[Dict[str, Any]]],
        shareholders_data: Optional[Dict[str, Any]],
        suspensions_data: Optional[List[Dict[str, Any]]]
    ) -> PillarScorecard:
        """Evaluates director/commissioner filings, KSEI institutional stability, and exchange notices."""
        # 1. Insider activity
        filings_count = len(insider_filings or [])
        buy_actions = 0
        sell_actions = 0
        insider_names = []
        if insider_filings:
            for f in insider_filings:
                act = str(f.get("transaction_type") or f.get("action") or "").lower()
                name = f.get("insider_name") or f.get("name") or ""
                if name and name not in insider_names:
                    insider_names.append(name)
                if "buy" in act or "beli" in act:
                    buy_actions += 1
                elif "sell" in act or "jual" in act:
                    sell_actions += 1

        # 2. Institutional vs Retail stability
        ksei_summary = "Struktur pemegang saham terdistribusi normal"
        if shareholders_data:
            inst_pct = shareholders_data.get("institutional_pct") or shareholders_data.get("institusi")
            retail_pct = shareholders_data.get("retail_pct") or shareholders_data.get("ritel")
            if inst_pct:
                ksei_summary = f"Institusi {inst_pct}%, Ritel {retail_pct or 100 - inst_pct}%"

        # 3. Suspensions
        has_suspension = bool(suspensions_data and len(suspensions_data) > 0)
        suspension_note = "Bebas dari suspensi & notasi UMA bursa terkini" if not has_suspension else f"Terdapat {len(suspensions_data)} catatan suspensi/UMA aktif"

        prompt = (
            f"Anda adalah Sub-Agent Spesialis Tata Kelola (Corporate Governance) & Regulasi BEI untuk {ticker}.\n"
            f"DATA TATA KELOLA & REGULASI:\n"
            f"- Transaksi Orang Dalam (Direksi/Komisaris): {filings_count} keterbukaan tercatat (Buy: {buy_actions}, Sell: {sell_actions})\n"
            f"- Tokoh Insider Terlibat: {', '.join(insider_names[:3]) or 'Belum ada transaksi signifikan'}\n"
            f"- Struktur Pemegang Saham KSEI: {ksei_summary}\n"
            f"- Status Regulasi BEI: {suspension_note}\n\n"
            "TUGAS:\n"
            "1. Tentukan Skor Tata Kelola dari 1 (risiko regulasi tinggi/insider dumping) hingga 10 (tata kelola bersih/insider high alignment).\n"
            "2. Tentukan Stance: 'CLEAN_GOVERNANCE', 'INSIDER_ACCUMULATION', 'GOVERNANCE_CAUTION', atau 'REGULATORY_WARNING'.\n"
            "3. Buat Verdict 1-2 kalimat dalam Bahasa Indonesia.\n"
            "4. Buat 3 poin utama (key_points) yang faktual.\n\n"
            "OUTPUT FORMAT JSON MURNI:\n"
            "{\n"
            '  "score": 9,\n'
            '  "stance": "CLEAN_GOVERNANCE",\n'
            '  "verdict": "Kalimat verdict tata kelola...",\n'
            '  "key_points": ["Poin 1", "Poin 2", "Poin 3"]\n'
            "}"
        )

        messages = [
            {"role": "system", "content": "You are an institutional corporate governance & regulatory risk specialist for the Indonesia Stock Exchange. Output strictly valid JSON."},
            {"role": "user", "content": prompt}
        ]

        if groq_rotator.has_keys():
            try:
                raw_res = await groq_rotator.generate_chat_completion(
                    messages=messages,
                    model=cls.SUBAGENT_MODEL,
                    temperature=0.1,
                    max_tokens=512,
                    response_format={"type": "json_object"}
                )
                clean_json = raw_res.strip()
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_json:
                    clean_json = clean_json.split("```")[1].split("```")[0].strip()

                parsed = json.loads(clean_json)
                return PillarScorecard(
                    pillar="GOVERNANCE",
                    title="Tata Kelola & Regulasi",
                    stance=parsed.get("stance", "CLEAN_GOVERNANCE").upper(),
                    score=max(1, min(10, int(parsed.get("score", 8)))),
                    verdict=parsed.get("verdict", f"Kepatuhan regulasi dan transparansi insider {ticker} dalam kategori memadai."),
                    key_points=parsed.get("key_points", [
                        f"{filings_count} keterbukaan transaksi insider tercatat di BEI (Buy: {buy_actions}, Sell: {sell_actions})",
                        f"Komposisi KSEI: {ksei_summary}",
                        suspension_note
                    ])[:3]
                )
            except Exception as err:
                logger.warning(f"Governance sub-agent failed ({err}), falling back to heuristics")

        # Fallback
        score = 8
        stance = "CLEAN_GOVERNANCE"
        if has_suspension:
            score = 3
            stance = "REGULATORY_WARNING"
        elif sell_actions > buy_actions and sell_actions >= 3:
            score = 5
            stance = "GOVERNANCE_CAUTION"
        elif buy_actions > 0 and sell_actions == 0:
            score = 9
            stance = "INSIDER_ACCUMULATION"

        return PillarScorecard(
            pillar="GOVERNANCE",
            title="Tata Kelola & Regulasi",
            stance=stance,
            score=score,
            verdict=f"Integritas tata kelola {ticker} berstatus {stance.lower().replace('_', ' ')} didukung kepatuhan keterbukaan BEI.",
            key_points=[
                f"Transaksi orang dalam: {buy_actions} pembelian vs {sell_actions} pelepasan",
                f"Struktur KSEI: {ksei_summary}",
                suspension_note
            ]
        )

    # =========================================================================
    # LEAD ARBITER: CONTRADICTION DETECTION & MASTER DOSSIER SYNTHESIS
    # =========================================================================
    @classmethod
    async def run_lead_arbiter(
        cls,
        ticker: str,
        fundamental_card: PillarScorecard,
        smart_money_card: PillarScorecard,
        governance_card: PillarScorecard
    ) -> Tuple[ContradictionAlert, str, str]:
        """
        Cross-analyzes all 3 sub-agent scorecards to spot market divergences / contradictions
        (e.g., Value Trap: Undervalued Fundamental vs Heavy Smart Money Distribution).
        Produces ContradictionAlert, master investment thesis, and tactical recommendation.
        """
        prompt = (
            f"Anda adalah Lead Research Arbiter & Chief Investment Strategist AlphaSector.\n"
            f"TUGAS: Analisis komparatif lintas-pilar hasil audit 3 sub-agent untuk emiten {ticker}:\n\n"
            f"1. PILAR FUNDAMENTAL:\n"
            f"   - Skor: {fundamental_card.score}/10 | Stance: {fundamental_card.stance}\n"
            f"   - Verdict: {fundamental_card.verdict}\n"
            f"   - Poin: {'; '.join(fundamental_card.key_points)}\n\n"
            f"2. PILAR SMART MONEY & FLOW:\n"
            f"   - Skor: {smart_money_card.score}/10 | Stance: {smart_money_card.stance}\n"
            f"   - Verdict: {smart_money_card.verdict}\n"
            f"   - Poin: {'; '.join(smart_money_card.key_points)}\n\n"
            f"3. PILAR TATA KELOLA & REGULASI:\n"
            f"   - Skor: {governance_card.score}/10 | Stance: {governance_card.stance}\n"
            f"   - Verdict: {governance_card.verdict}\n"
            f"   - Poin: {'; '.join(governance_card.key_points)}\n\n"
            "IDENTIFIKASI KONTRADIKSI PASAR (DIVERGENSI):\n"
            "- Apakah ada benturan keras antar pilar? Contoh:\n"
            "  * Fundamental Undervalued / Skor Tinggi (>=7) TAPI Smart Money Distribusi Berat / Skor Rendah (<=4) -> Value Trap Alert (High Risk)!\n"
            "  * Fundamental Overvalued / Mahal (<=4) TAPI Smart Money Akumulasi Agresif (>=7) -> Speculative Momentum Divergence (Medium Risk)!\n"
            "  * Fundamental Bagus TAPI Insider Pelepasan Saham Masif / Ada Suspensi -> Governance Divergence (High Risk)!\n"
            "- Jika semua pilar selaras searah (misal sama-sama bagus atau sama-sama netral), has_contradiction = false.\n\n"
            "OUTPUT FORMAT JSON MURNI:\n"
            "{\n"
            '  "has_contradiction": true | false,\n'
            '  "headline": "Headline peringatan singkat, misal: Value Trap Alert: Valuasi Murah Berbenturan dengan Distribusi Bandar Masif",\n'
            '  "description": "Ulasan analitis 2 kalimat yang menjelaskan mengapa kedua pilar bertolak belakang dan apa risikonya bagi pemodal.",\n'
            '  "risk_level": "HIGH" | "MEDIUM" | "LOW" | "NONE",\n'
            '  "divergence_pillars": ["Fundamental & Valuasi", "Smart Money & Broker Flow"],\n'
            '  "master_verdict": "Thesis investasi komprehensif 2-3 kalimat yang mengintegrasikan seluruh temuan secara elegan.",\n'
            '  "tactical_recommendation": "ACCUMULATE" | "BUY_ON_WEAKNESS" | "WAIT_AND_SEE" | "AVOID"\n'
            "}"
        )

        messages = [
            {"role": "system", "content": "You are a master equity research arbiter detecting market divergences. Output strictly valid JSON."},
            {"role": "user", "content": prompt}
        ]

        if groq_rotator.has_keys():
            try:
                raw_res = await groq_rotator.generate_chat_completion(
                    messages=messages,
                    model=cls.ARBITER_MODEL,
                    temperature=0.2,
                    max_tokens=768,
                    response_format={"type": "json_object"}
                )
                clean_json = raw_res.strip()
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_json:
                    clean_json = clean_json.split("```")[1].split("```")[0].strip()

                parsed = json.loads(clean_json)
                alert = ContradictionAlert(
                    has_contradiction=bool(parsed.get("has_contradiction", False)),
                    headline=parsed.get("headline", "Peringatan Divergensi Pasar"),
                    description=parsed.get("description", "Terdapat perbedaan sinyal antara analisis fundamental dan pergerakan aliran bandar."),
                    risk_level=parsed.get("risk_level", "MEDIUM").upper(),
                    divergence_pillars=parsed.get("divergence_pillars", [])
                )
                master_verdict = parsed.get("master_verdict", f"Kombinasi analisis {ticker} menunjukkan perlunya kehati-hatian dalam penentuan momentum masuk.")
                tactical_rec = parsed.get("tactical_recommendation", "WAIT_AND_SEE").upper()
                return alert, master_verdict, tactical_rec
            except Exception as err:
                logger.warning(f"Lead arbiter reasoning failed ({err}), falling back to heuristic arbiter")

        # Heuristic Arbiter Fallback
        f_score = fundamental_card.score
        sm_score = smart_money_card.score
        g_score = governance_card.score

        has_divergence = False
        headline = "Konsensus Selaras Antar Pilar"
        desc = f"Seluruh indikator fundamental, smart money, dan tata kelola emiten {ticker} bergerak dalam sinyal yang seimbang."
        risk = "LOW"
        pillars = []
        tactical = "WAIT_AND_SEE"

        # Check classic Value Trap: Fundamental High vs Smart Money Low
        if f_score >= 7 and sm_score <= 4:
            has_divergence = True
            headline = f"Value Trap Alert: Valuasi {ticker} Menarik, Namun Tekanan Distribusi Bandar Berat"
            desc = "Secara metrik neraca saham terlihat murah (undervalued), namun broker institusional terus melakukan distribusi bersih. Berisiko terkunci dalam tren sideways atau penurunan lanjutan."
            risk = "HIGH"
            pillars = ["Fundamental & Valuasi", "Smart Money & Broker Flow"]
            tactical = "WAIT_AND_SEE"
        elif f_score <= 4 and sm_score >= 7:
            has_divergence = True
            headline = f"Speculative Momentum: Aliran Dana Agresif di Tengah Valuasi Premium {ticker}"
            desc = "Meskipun valuasi fundamental relatif mahal, aliran dana smart money terpantau mengakumulasi secara terpusat. Cocok untuk strategi momentum trading jangka pendek dengan disiplin stop loss ketat."
            risk = "MEDIUM"
            pillars = ["Fundamental & Valuasi", "Smart Money & Broker Flow"]
            tactical = "BUY_ON_WEAKNESS"
        elif g_score <= 4:
            has_divergence = True
            headline = f"Governance & Regulatory Caution: Terdeteksi Catatan Khusus Regulasi {ticker}"
            desc = "Terdapat anomali transaksi orang dalam atau catatan pengawasan bursa yang memerlukan verifikasi kepatuhan mendalam sebelum mengambil keputusan alokasi dana."
            risk = "HIGH"
            pillars = ["Tata Kelola & Regulasi"]
            tactical = "AVOID"
        elif f_score >= 7 and sm_score >= 7:
            tactical = "ACCUMULATE"
            headline = f"High-Conviction Alignment: Fundamental Prima Didukung Akumulasi Kuat"
            desc = f"Emiten {ticker} menikmati konvergensi positif di mana kesehatan finansial prima dikonfirmasi oleh arus modal institusi yang konsisten."
            risk = "NONE"

        alert = ContradictionAlert(
            has_contradiction=has_divergence,
            headline=headline,
            description=desc,
            risk_level=risk,
            divergence_pillars=pillars
        )
        master_verdict = (
            f"Secara agregat, {ticker} mencatat skor Fundamental {f_score}/10, Smart Money {sm_score}/10, dan Tata Kelola {g_score}/10. "
            f"Rekomendasi taktis diarahkan pada tindakan {tactical.replace('_', ' ')}."
        )
        return alert, master_verdict, tactical

    # =========================================================================
    # MASTER ORCHESTRATION PIPELINE
    # =========================================================================
    @classmethod
    async def execute_composite_research(
        cls,
        ticker: str,
        report_data: Optional[Dict[str, Any]],
        peer_item: Optional[Dict[str, Any]],
        broker_summary_data: Optional[Dict[str, Any]],
        foreign_flow_data: Optional[Dict[str, Any]],
        insider_filings_data: Optional[List[Dict[str, Any]]],
        shareholders_data: Optional[Dict[str, Any]],
        suspensions_data: Optional[List[Dict[str, Any]]],
        on_subagent_step: Optional[Callable[[str, str], Awaitable[None]]] = None
    ) -> CompositeDossierPayload:
        """
        Executes the 3 specialized sub-agents in parallel via asyncio.gather,
        then runs the Lead Arbiter to produce the full CompositeStockDossier.
        """
        logger.info(f"Starting Multi-Agent Groq Harness for {ticker}...")

        if on_subagent_step:
            await on_subagent_step("DISPATCH", f"Mengaktifkan 3 Groq Sub-Agents paralel untuk audit komprehensif {ticker}")

        # Run 3 specialized sub-agents concurrently
        fundamental_task = cls.run_fundamental_agent(ticker, report_data, peer_item)
        smart_money_task = cls.run_smart_money_agent(ticker, broker_summary_data, foreign_flow_data)
        governance_task = cls.run_governance_agent(ticker, insider_filings_data, shareholders_data, suspensions_data)

        fundamental_res, smart_money_res, governance_res = await asyncio.gather(
            fundamental_task,
            smart_money_task,
            governance_task
        )

        if on_subagent_step:
            await on_subagent_step("FUNDAMENTAL", f"Pilar Fundamental: Skor {fundamental_res.score}/10 ({fundamental_res.stance})")
            await on_subagent_step("SMART_MONEY", f"Pilar Smart Money: Skor {smart_money_res.score}/10 ({smart_money_res.stance})")
            await on_subagent_step("GOVERNANCE", f"Pilar Tata Kelola: Skor {governance_res.score}/10 ({governance_res.stance})")
            await on_subagent_step("ARBITER", "Menjalankan Lead Arbiter untuk komparasi lintas-pilar & deteksi divergensi pasar...")

        # Run Lead Arbiter
        alert, master_verdict, tactical_rec = await cls.run_lead_arbiter(
            ticker=ticker,
            fundamental_card=fundamental_res,
            smart_money_card=smart_money_res,
            governance_card=governance_res
        )

        if on_subagent_step:
            contradiction_msg = f"Divergensi Terdeteksi: {alert.headline}" if alert.has_contradiction else "Semua Pilar Konsisten Selaras"
            await on_subagent_step("COMPLETE", f"{contradiction_msg} | Rekomendasi: {tactical_rec}")

        return CompositeDossierPayload(
            ticker=ticker,
            contradiction=alert,
            pillars=[fundamental_res, smart_money_res, governance_res],
            master_verdict=master_verdict,
            tactical_recommendation=tactical_rec
        )


multi_agent_harness = MultiAgentHarness()
