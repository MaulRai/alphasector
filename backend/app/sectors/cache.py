import time
from typing import Any, Optional, Dict

class SimpleTTLCache:
    """In-memory thread-safe TTL cache for static API data."""
    def __init__(self, default_ttl_seconds: int = 600):
        self.default_ttl = default_ttl_seconds
        self._store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key not in self._store:
            return None
        entry = self._store[key]
        if time.time() > entry["expires_at"]:
            del self._store[key]
            return None
        return entry["value"]

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        self._store[key] = {
            "value": value,
            "expires_at": time.time() + ttl
        }

    def clear(self) -> None:
        self._store.clear()

cache = SimpleTTLCache(default_ttl_seconds=600)
