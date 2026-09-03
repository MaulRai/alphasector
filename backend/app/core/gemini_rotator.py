import os
import re
import asyncio
import logging
import httpx
from typing import List, Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

logger = logging.getLogger("gemini_rotator")

class GeminiKeyRotator:
    """
    Manages API Key Rotation for Google Gemini Vision API across multiple keys
    matching the pattern GEMINI_API_KEY_{n} or GEMINI_API_KEY.
    Provides automatic round-robin and rate-limit / error failover.
    """

    def __init__(self):
        self._keys: List[str] = []
        self._current_index = 0
        self._lock = asyncio.Lock()
        self.reload_keys()

    def reload_keys(self) -> List[str]:
        """Scans environment for all GEMINI_API_KEY_* keys and sorts them."""
        found_keys: Dict[int, str] = {}
        fallback_keys: List[str] = []

        for k, v in os.environ.items():
            if not v or not v.strip():
                continue
            
            # Match GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
            match = re.match(r"^GEMINI_API_KEY_(\d+)$", k, re.IGNORECASE)
            if match:
                idx = int(match.group(1))
                found_keys[idx] = v.strip()
            elif k.upper() == "GEMINI_API_KEY":
                fallback_keys.append(v.strip())

        # Sort numbered keys in ascending order
        sorted_keys = [found_keys[i] for i in sorted(found_keys.keys())]
        for fb in fallback_keys:
            if fb not in sorted_keys:
                sorted_keys.append(fb)

        self._keys = sorted_keys
        logger.info(f"Loaded {len(self._keys)} Gemini API key(s) for rotation.")
        return self._keys

    @property
    def key_count(self) -> int:
        return len(self._keys)

    def has_keys(self) -> bool:
        return len(self._keys) > 0

    async def get_next_key(self) -> Optional[str]:
        """Gets next API key in round-robin sequence."""
        if not self._keys:
            return None
        async with self._lock:
            key = self._keys[self._current_index % len(self._keys)]
            self._current_index = (self._current_index + 1) % len(self._keys)
            return key

    async def analyze_financial_image(
        self,
        image_base64: str,
        mime_type: str = "image/png",
        user_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calls Google Gemini Vision API to extract financial chart/report context.
        Uses gemini-2.5-flash with automatic key rotation and failover.
        """
        if not self._keys:
            raise RuntimeError("No GEMINI_API_KEY found in environment or .env file.")

        keys_to_try = list(self._keys)
        last_error = None

        system_instruction = (
            "Anda adalah Vision Intelligence Specialist pasar modal Indonesia (IDX) untuk AlphaSector Autonomous Equity Research. "
            "Tugas Anda adalah membaca gambar finansial (bisa berupa Chart Candlestick TradingView, Tangkapan Layar Laporan Keuangan IDX, "
            "Tabel Broker Summary Bandarmology, atau Tangkapan Layar Aplikasi Sekuritas seperti IPOT/Ajaib/Mirae). "
            "Lakukan observasi fakta visual secara teliti, objektif, dan terstruktur.\n\n"
            "EKSTRAK DAN SEBUTKAN:\n"
            "1. Ticker saham yang teridentifikasi jelas (misal: BBRI, BBCA, ASII, ADRO) jika ada.\n"
            "2. Tipe gambar (misal: Chart Candlestick Harian/Mingguan, Neraca/Laba Rugi, Broker Summary, atau Data Konsensus).\n"
            "3. Indikator/angka penting yang terlihat di layar: level harga terakhir, support, resistance, MA, volume spike, atau akumulasi broker.\n"
            "4. Rangkuman singkat fakta visual (2-4 kalimat) dalam Bahasa Indonesia profesional agar dapat diinjeksi ke analis fundamental pasar modal."
        )

        prompt_text = (
            f"Pertanyaan analis pengguna: '{user_prompt or 'Jelaskan dan analisis konteks gambar ini'}'\n\n"
            "Analisis gambar finansial ini sekarang dan sajikan temuannya secara padat dan terstruktur."
        )

        # Request payload for Gemini Generative Language REST API
        request_body = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_instruction}\n\n{prompt_text}"},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": image_base64
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 800
            }
        }

        # Try gemini-2.5-flash with fallback to gemini-1.5-flash
        models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash"]

        for key in keys_to_try:
            for model_name in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}"
                try:
                    async with httpx.AsyncClient(timeout=25.0) as client:
                        resp = await client.post(
                            url,
                            json=request_body,
                            headers={"Content-Type": "application/json"}
                        )
                    
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            extracted_text = "".join(p.get("text", "") for p in parts if "text" in p)
                            
                            # Extract potential ticker from vision output
                            detected_ticker = self._extract_potential_ticker(extracted_text)
                            
                            return {
                                "success": True,
                                "model": model_name,
                                "visual_summary": extracted_text.strip(),
                                "detected_ticker": detected_ticker
                            }
                        else:
                            last_error = f"Gemini returned no candidates: {resp.text}"
                    elif resp.status_code in (429, 403, 400):
                        last_error = f"Gemini {resp.status_code}: {resp.text}"
                        logger.warning(f"Gemini API key returned {resp.status_code}, rotating to next key...")
                        break  # Break model loop to rotate key
                    else:
                        last_error = f"Gemini HTTP {resp.status_code}: {resp.text}"
                except Exception as ex:
                    last_error = str(ex)
                    logger.warning(f"Error connecting to Gemini with key {key[:8]}...: {ex}")

        raise RuntimeError(f"All Gemini API keys failed. Last error: {last_error}")

    def _extract_potential_ticker(self, text: str) -> Optional[str]:
        """Extracts potential 4-letter Indonesian stock ticker identified in visual text."""
        match = re.search(r'\b([A-Z]{4})(?:\.JK)?\b', text)
        if match:
            cand = match.group(1).upper()
            if cand not in ("CHART", "PRICE", "TIME", "DATE", "DATA", "PEER", "INFO", "USER", "TEXT", "VIEW"):
                return cand
        return None

gemini_rotator = GeminiKeyRotator()
