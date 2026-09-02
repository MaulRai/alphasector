import os
import json
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.groq_rotator import groq_rotator
from app.schemas.agent import SynthesisResult, AgentIntent

logger = logging.getLogger("synthesizer")

class AgentSynthesizer:
    """Generates structured, fact-grounded equity research synthesis in Bahasa Indonesia using Groq."""

    MANDATORY_DISCLAIMER = (
        "⚠️ DISCLAIMER: AlphaSector adalah alat bantu analisis dan riset finansial otonom "
        "berbasis data pasar modal resmi Sectors Financial API. Informasi yang disajikan "
        "bersifat edukatif dan analitis, BUKAN merupakan rekomendasi atau ajakan jual/beli efek. "
        "Keputusan investasi sepenuhnya merupakan tanggung jawab investor pribadi."
    )

    @classmethod
    async def synthesize(
        cls,
        query: str,
        intent: AgentIntent,
        tickers: List[str],
        reports: List[Dict[str, Any]],
        peer_matrix: Optional[List[Dict[str, Any]]],
        broker_summary: Optional[Dict[str, Any]],
        screener_data: Optional[Dict[str, Any]]
    ) -> SynthesisResult:
        """Synthesizes structured research dossier using Groq (OpenAI 120b) with key rotation or deterministic fallback."""
        
        # Check if Groq API keys are available in rotation
        if groq_rotator.has_keys():
            try:
                return await cls._synthesize_with_groq(
                    query, intent, tickers, reports, peer_matrix, broker_summary, screener_data
                )
            except Exception as e:
                logger.warning(f"Groq LLM synthesis error, using intelligent deterministic fallback: {e}")
                
        # Deterministic Fact-Grounded Fallback
        return cls._synthesize_fallback(
            query, intent, tickers, reports, peer_matrix, broker_summary, screener_data
        )

    @classmethod
    async def _synthesize_with_groq(
        cls,
        query: str,
        intent: AgentIntent,
        tickers: List[str],
        reports: List[Dict[str, Any]],
        peer_matrix: Optional[List[Dict[str, Any]]],
        broker_summary: Optional[Dict[str, Any]],
        screener_data: Optional[Dict[str, Any]]
    ) -> SynthesisResult:
        screener_list = []
        if isinstance(screener_data, dict):
            screener_list = screener_data.get("companies") or screener_data.get("results") or screener_data.get("data") or []
        elif isinstance(screener_data, list):
            screener_list = screener_data

        context_data = {
            "query": query,
            "intent": intent.value,
            "tickers": tickers,
            "peer_matrix": peer_matrix,
            "broker_summary": broker_summary,
            "screener_results": screener_list[:6] if screener_list else None
        }

        system_prompt = (
            "Anda adalah AlphaSector, Senior Autonomous Equity Research Analyst pasar modal Indonesia (IDX).\n"
            "Tugas Anda menyintesis data pasar modal resmi dari Sectors API ke dalam laporan riset yang tajam, objektif, dan berbasis fakta.\n\n"
            "ATURAN MUTLAK:\n"
            "1. Tulis seluruh analisis dalam Bahasa Indonesia profesional dan lugas.\n"
            "2. Semua angka valuasi (PE, PBV, ROE, Dividen) WAJIB mengacu persis pada data JSON yang diberikan tanpa halusinasi.\n"
            "3. Buat 3 pertanyaan lanjutan ('suggested_followups') yang sangat relevan, spesifik, dan tajam untuk membantu analis mendalami riset ini lebih lanjut.\n"
            "4. Output WAJIB berupa objek JSON valid dengan struktur skema persis berikut:\n"
            "{\n"
            '  "executive_summary": "Ringkasan eksekutif 2-3 kalimat mengenai temuan utama riset ini.",\n'
            '  "key_findings": ["Poin kunci 1", "Poin kunci 2", "Poin kunci 3"],\n'
            '  "valuation_verdict": "Penilaian valuasi objektif (apakah terdiskon, wajar, atau premium dibanding peer).",\n'
            '  "smart_money_flow": "Analisis aliran akumulasi broker institusi & foreign flow.",\n'
            '  "catalysts": ["Katalis positif 1", "Katalis positif 2"],\n'
            '  "risks": ["Faktor risiko 1", "Faktor risiko 2"],\n'
            '  "suggested_followups": ["Pertanyaan follow up 1", "Pertanyaan follow up 2", "Pertanyaan follow up 3"]\n'
            "}"
        )

        user_prompt = f"DATA TERVERIFIKASI DARI SECTORS API:\n```json\n{json.dumps(context_data, indent=2, ensure_ascii=False)}\n```\n\nBuat analisis komprehensif sekarang dalam format JSON:"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        text = await groq_rotator.generate_chat_completion(
            messages=messages,
            model=settings.GROQ_MODEL,
            temperature=0.2,
            response_format={"type": "json_object"}
        )

        text = text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        parsed = json.loads(text)
        
        # Ensure default followups if model didn't return any
        followups = parsed.get("suggested_followups") or []
        if not followups:
            if tickers:
                followups = [
                    f"Bagaimana pergerakan aliran broker asing {tickers[0]} dalam 1 bulan terakhir?",
                    f"Bandingkan margin laba bersih {tickers[0]} dengan kompetitor terdekat",
                    f"Tampilkan rincian segmen pendapatan dan kontribusi bisnis {tickers[0]}"
                ]
            else:
                followups = [
                    "Tampilkan 5 saham dengan dividend yield tertinggi di IDX",
                    "Cari saham perbankan dengan valuasi PBV di bawah 1.5x",
                    "Analisis emiten dengan akumulasi broker asing terbesar pekan ini"
                ]

        return SynthesisResult(
            executive_summary=parsed.get("executive_summary", ""),
            key_findings=parsed.get("key_findings", []),
            valuation_verdict=parsed.get("valuation_verdict"),
            smart_money_flow=parsed.get("smart_money_flow"),
            catalysts=parsed.get("catalysts", []),
            risks=parsed.get("risks", []),
            suggested_followups=followups[:3],
            disclaimer=cls.MANDATORY_DISCLAIMER
        )

    @classmethod
    def _synthesize_fallback(
        cls,
        query: str,
        intent: AgentIntent,
        tickers: List[str],
        reports: List[Dict[str, Any]],
        peer_matrix: Optional[List[Dict[str, Any]]],
        broker_summary: Optional[Dict[str, Any]],
        screener_data: Optional[Dict[str, Any]]
    ) -> SynthesisResult:
        """Deterministic high-quality fallback generator when LLM is unavailable or offline."""
        
        followups = []
        if peer_matrix and len(peer_matrix) >= 2:
            lowest_pe = next((p for p in peer_matrix if p.get("is_lowest_pe")), peer_matrix[0])
            highest_roe = next((p for p in peer_matrix if p.get("is_highest_roe")), peer_matrix[0])
            
            exec_summary = (
                f"Analisis komparasi multi-emiten ({', '.join(tickers[:5])}) menunjukkan profil fundamental yang beragam. "
                f"{lowest_pe['symbol']} menawarkan valuasi paling atraktif dengan PE {lowest_pe.get('pe', '-')}x, "
                f"sementara {highest_roe['symbol']} mencatatkan profitabilitas modal tertinggi dengan ROE {highest_roe.get('roe', '-')}%. "
                f"Secara keseluruhan, sektor ini menunjukkan fundamental yang solid dengan pertumbuhan stabil."
            )
            
            key_findings = [
                f"Valuasi terendah: {lowest_pe['symbol']} (PE: {lowest_pe.get('pe', '-')}x, PBV: {lowest_pe.get('pbv', '-')}x)",
                f"Efisiensi modal terbaik: {highest_roe['symbol']} (ROE: {highest_roe.get('roe', '-')}%, NPM: {highest_roe.get('npm', '-')}%)",
                f"Dividen: {peer_matrix[0]['symbol']} membagikan yield sebesar {peer_matrix[0].get('dividend_yield', 0)}%"
            ]
            
            valuation_verdict = (
                f"Berdasarkan rasio harga terhadap laba (P/E), {lowest_pe['symbol']} berada pada posisi terdiskon dibanding peers-nya."
            )

            followups = [
                f"Bagaimana pergerakan akumulasi broker pada {lowest_pe['symbol']}?",
                f"Bandingkan breakdown segmen laba antara {peer_matrix[0]['symbol']} dan {peer_matrix[1]['symbol'] if len(peer_matrix)>1 else lowest_pe['symbol']}",
                f"Cek riwayat pembagian dividen dan payout ratio {highest_roe['symbol']}"
            ]
            
        elif peer_matrix and len(peer_matrix) == 1:
            p = peer_matrix[0]
            exec_summary = (
                f"{p['symbol']} ({p['company_name']}) beroperasi di sektor {p['sector']} ({p['sub_sector']}). "
                f"Emiten ini memiliki kapitalisasi pasar sebesar Rp {p.get('market_cap', 0):,}, "
                f"diperdagangkan pada valuasi PE {p.get('pe', '-')}x dan PBV {p.get('pbv', '-')}x dengan ROE {p.get('roe', '-')}%. "
                f"Kondisi neraca keuangan menunjukkan rasio DER sebesar {p.get('der', '-')}, mencerminkan struktur leverage yang terukur."
            )
            
            key_findings = [
                f"Kapitalisasi Pasar: Rp {p.get('market_cap', 0):,}",
                f"Valuasi: P/E {p.get('pe', '-')}x | PBV {p.get('pbv', '-')}x",
                f"Profitabilitas: ROE {p.get('roe', '-')}%, Margin Laba Bersih {p.get('npm', '-')}%, Dividend Yield {p.get('dividend_yield', 0)}%"
            ]
            
            valuation_verdict = f"Valuasi {p['symbol']} saat ini tergolong kompetitif di subsektor {p['sub_sector']}."
            
            followups = [
                f"Siapa saja 3 broker institusi pembeli terbesar di {p['symbol']}?",
                f"Bandingkan valuasi {p['symbol']} dengan kompetitor sektor {p['sector']}",
                f"Bagaimana rincian lini bisnis dan segmen pendapatan {p['symbol']}?"
            ]
            
        elif screener_data and "results" in screener_data:
            results = screener_data.get("results", [])
            top_symbols = [x.get("symbol") for x in results[:5]]
            exec_summary = (
                f"Hasil screening pasar modal berhasil menemukan {len(results)} emiten yang memenuhi kriteria pencarian: '{query}'. "
                f"Top emiten teratas meliputi: {', '.join(top_symbols)}."
            )
            key_findings = [f"Emiten: {x.get('symbol')} - {x.get('company_name')}" for x in results[:4]]
            valuation_verdict = "Daftar emiten di atas disaring berdasarkan kriteria performa fundamental dan likuiditas terbaik."
            followups = [
                f"Bandingkan valuasi langsung antara {top_symbols[0]} vs {top_symbols[1] if len(top_symbols)>1 else ''}",
                "Analisis aliran dana asing pada emiten dengan kapitalisasi terbesar",
                "Filter ulang dengan kriteria dividend yield di atas 5%"
            ]
        else:
            exec_summary = f"Analisis terhadap query '{query}' telah berhasil dieksekusi melalui Sectors Financial API."
            key_findings = ["Data pasar terverifikasi", "Koneksi data real-time aktif"]
            valuation_verdict = "Disarankan melihat perbandingan rasio finansial spesifik pada dashboard."
            followups = [
                "Bandingkan 4 saham perbankan terbesar (BBCA, BBRI, BMRI, BBNI)",
                "Tampilkan saham dengan pertumbuhan laba di atas 20%",
                "Cek emiten dengan net foreign inflow terbesar hari ini"
            ]

        # Broker sentiment summary
        broker_sentiment = "Netral"
        if broker_summary:
            sent = broker_summary.get("sentiment", "NEUTRAL")
            if "ACCUMULATION" in sent:
                broker_sentiment = f"Terindikasi AKUMULASI institusi dengan konsentrasi pembeli {broker_summary.get('buyer_concentration', 50)}%."
            elif "DISTRIBUTION" in sent:
                broker_sentiment = f"Terindikasi DISTRIBUSI dengan tekanan jual aktif."

        return SynthesisResult(
            executive_summary=exec_summary,
            key_findings=key_findings,
            valuation_verdict=valuation_verdict,
            smart_money_flow=f"Aktivitas Broker: {broker_sentiment}",
            catalysts=[
                "Ekspansi pertumbuhan pendapatan berkelanjutan",
                "Kestabilan pembagian dividen tahunan",
                "Katalis positif pemulihan makroekonomi domestik"
            ],
            risks=[
                "Volatilitas suku bunga dan fluktuasi nilai tukar rupiah",
                "Risiko siklus sektoral dan perubahan regulasi industri"
            ],
            suggested_followups=followups[:3],
            disclaimer=cls.MANDATORY_DISCLAIMER
        )

synthesizer = AgentSynthesizer()
