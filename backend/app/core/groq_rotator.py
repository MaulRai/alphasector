import os
import re
import asyncio
import logging
import httpx
from typing import List, Optional, Dict, Any

logger = logging.getLogger("groq_rotator")

class GroqKeyRotator:
    """
    Manages API Key Rotation for Groq API across multiple keys
    matching the pattern GROQ_API_KEY_{n} or GROQ_API_KEY.
    Provides automatic round-robin and rate-limit (429) failover.
    """

    def __init__(self):
        self._keys: List[str] = []
        self._current_index = 0
        self._lock = asyncio.Lock()
        self.reload_keys()

    def reload_keys(self) -> List[str]:
        """Scans environment for all GROQ_API_KEY_* keys and sorts them."""
        found_keys: Dict[int, str] = {}
        fallback_keys: List[str] = []

        for k, v in os.environ.items():
            if not v or not v.strip():
                continue
            
            # Match GROQ_API_KEY_1, GROQ_API_KEY_2, etc.
            match = re.match(r"^GROQ_API_KEY_(\d+)$", k, re.IGNORECASE)
            if match:
                idx = int(match.group(1))
                found_keys[idx] = v.strip()
            elif k.upper() == "GROQ_API_KEY":
                fallback_keys.append(v.strip())

        # Sort numbered keys in ascending order
        sorted_keys = [found_keys[i] for i in sorted(found_keys.keys())]
        # Append standalone GROQ_API_KEY if not already included
        for fb in fallback_keys:
            if fb not in sorted_keys:
                sorted_keys.append(fb)

        self._keys = sorted_keys
        logger.info(f"Loaded {len(self._keys)} Groq API key(s) for rotation.")
        return self._keys

    @property
    def key_count(self) -> int:
        return len(self._keys)

    def has_keys(self) -> bool:
        return len(self._keys) > 0

    async def get_next_key(self) -> Optional[str]:
        """Gets next API key in round-robin sequence."""
        if not self._keys:
            self.reload_keys()
        if not self._keys:
            return None
        
        async with self._lock:
            key = self._keys[self._current_index % len(self._keys)]
            self._current_index = (self._current_index + 1) % len(self._keys)
            return key

    async def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "openai/gpt-oss-120b",
        temperature: float = 0.2,
        max_tokens: int = 2048,
        response_format: Optional[Dict[str, str]] = None
    ) -> str:
        """
        Executes chat completion with automatic API key rotation and retry on 429 / failure.
        """
        if not self._keys:
            self.reload_keys()

        if not self._keys:
            raise ValueError("No GROQ_API_KEY found in environment or .env file.")

        total_keys = len(self._keys)
        attempts = 0
        last_error = None

        headers = {
            "Content-Type": "application/json"
        }

        url = "https://api.groq.com/openai/v1/chat/completions"

        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        if response_format:
            payload["response_format"] = response_format

        # Try up to total_keys times
        while attempts < total_keys:
            key = await self.get_next_key()
            if not key:
                break

            current_headers = {**headers, "Authorization": f"Bearer {key}"}
            masked_key = f"{key[:8]}...{key[-4:]}" if len(key) > 12 else "***"

            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, headers=current_headers, json=payload)
                    
                    if resp.status_code == 200:
                        data = resp.json()
                        content = data["choices"][0]["message"]["content"]
                        logger.info(f"Groq completion success with key {masked_key} (model: {model})")
                        return content
                    elif resp.status_code in (429, 401, 403):
                        logger.warning(
                            f"Groq API key {masked_key} returned HTTP {resp.status_code}. Rotating to next key..."
                        )
                        last_error = f"HTTP {resp.status_code}: {resp.text}"
                        attempts += 1
                        continue
                    else:
                        logger.error(f"Groq API error {resp.status_code}: {resp.text}")
                        last_error = f"HTTP {resp.status_code}: {resp.text}"
                        attempts += 1
                        continue

            except Exception as e:
                logger.warning(f"Network error with key {masked_key}: {e}. Rotating to next key...")
                last_error = str(e)
                attempts += 1
                continue

        raise RuntimeError(f"All Groq API keys ({total_keys} keys) failed. Last error: {last_error}")

groq_rotator = GroqKeyRotator()
