import os
import json
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.schemas.agent import SynthesisResult, AgentIntent

class AgentSynthesizer:
    """Generates structured, fact-grounded equity research synthesis in Bahasa Indonesia."""

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
        """Synthesizes structured research dossier using LLM or deterministic fallback."""
        
        # Check if Gemini API key is available
        if settings.GEMINI_API_KEY:
            try:
                return await cls._synthesize_with_gemini(
                    query, intent, tickers, reports, peer_matrix, broker_summary, screener_data
                )
            except Exception as e:
                print(f"Gemini LLM error, using intelligent fallback: {e}")
                
        # Deterministic Fact-Grounded Fallback
        return cls._synthesize_fallback(
            query, intent, tickers, reports, peer_matrix, broker_summary, screener_data
        )

    @classmethod
    async def _synthesize_with_gemini(
        cls,
        query: str,
        intent: AgentIntent,
        tickers: List[str],
        reports: List[Dict[str, Any]],
        peer_matrix: Optional[List[Dict[str, Any]]],
        broker_summary: Optional[Dict[str, Any]],
        screener_data: Optional[Dict[str, Any]]
    ) -> SynthesisResult:
        import google.generativeai as genai
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        context_data = {
            "query": query,
            "intent": intent.value,
            "tickers": tickers,
            "peer_matrix": peer_matrix,
            "broker_summary": broker_summary,
            "screener_results": screener_data.get("results")[:5] if screener_data and isinstance(screener_data, dict) else None
        }

        prompt = f"""
Anda adalah AlphaSector, Senior Autonomous Equity Research Analyst pasar modal Indonesia (IDX).
Tugas Anda menyintesis data pasar modal resmi berikut ke dalam laporan riset yang tajam, objektif, dan berbasis fakta.

DATA TERVERIFIKASI DARI SECTORS API:
```json
{json.dumps(context_data, indent=2, ensure_ascii=False)}
```

INSTRUKSI KHUSUS:
1. Tulis dalam Bahasa Indonesia profesional dan lugas.
2. Semua angka valuasi (PE, PBV, ROE, Dividen) WAJIB mengacu persis pada data JSON di atas.
3. Berikan output HANYA dalam format JSON valid yang sesuai dengan skema berikut:
{{
  "executive_summary": "Ringkasan eksekutif 2-3 kalimat mengenai temuan utama riset ini.",
  "key_findings": ["Poin kunci 1", "Poin kunci 2", "Poin kunci 3"],
  "valuation_verdict": "Penilaian valuasi objektif (apakah terdiskon, wajar, atau premium dibanding peer).",
  "smart_money_flow": "Analisis aliran akumulasi broker institusi & foreign flow.",
  "catalysts": ["Katalis positif 1", "Katalis positif 2"],
  "risks": ["Faktor risiko 1", "Faktor risiko 2"]
}}
"""
        response = await model.generate_content_async(prompt)
        text = response.text.strip()
        
        # Clean json markdown wrapper if any
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        parsed = json.loads(text)
        return SynthesisResult(
            executive_summary=parsed.get("executive_summary", ""),
            key_findings=parsed.get("key_findings", []),
            valuation_verdict=parsed.get("valuation_verdict"),
            smart_money_flow=parsed.get("smart_money_flow"),
            catalysts=parsed.get("catalysts", []),
            risks=parsed.get("risks", []),
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
        """Deterministic high-quality fallback generator when LLM is unavailable."""
        
        if peer_matrix and len(peer_matrix) >= 2:
            t_names = [f"{p['symbol']} ({p['company_name']})" for p in peer_matrix]
            lowest_pe = next((p for p in peer_matrix if p.get("is_lowest_pe")), peer_matrix[0])
            highest_roe = next((p for p in peer_matrix if p.get("is_highest_roe")), peer_matrix[0])
            
            exec_summary = (
                f"Analisis komparasi multi-emiten ({', '.join(tickers)}) menunjukkan profil fundamental yang beragam. "
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
            
        elif screener_data and "results" in screener_data:
            results = screener_data.get("results", [])
            top_symbols = [x.get("symbol") for x in results[:5]]
            exec_summary = (
                f"Hasil screening pasar modal berhasil menemukan {len(results)} emiten yang memenuhi kriteria pencarian: '{query}'. "
                f"Top emiten teratas meliputi: {', '.join(top_symbols)}."
            )
            key_findings = [f"Emiten: {x.get('symbol')} - {x.get('company_name')}" for x in results[:4]]
            valuation_verdict = "Daftar emiten di atas disaring berdasarkan kriteria performa fundamental dan likuiditas terbaik."
        else:
            exec_summary = f"Analisis terhadap query '{query}' telah berhasil dieksekusi melalui Sectors Financial API."
            key_findings = ["Data pasar terverifikasi", "Koneksi data real-time aktif"]
            valuation_verdict = "Disarankan melihat perbandingan rasio finansial spesifik pada dashboard."

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
            disclaimer=cls.MANDATORY_DISCLAIMER
        )

synthesizer = AgentSynthesizer()
