import os
import json
import time
import hashlib
from pathlib import Path
from typing import Any, Optional, Dict

class PersistentDiskCache:
    """
    Two-Tier Cache (In-Memory + Persistent Disk Cache).
    
    In DEV mode:
    - Automatically caches all Sectors API responses to `backend/.cache/sectors/{hash}.json`.
    - Persists across FastAPI reloads (--reload), dev server restarts, and page refreshes.
    - Consumes ZERO Sectors API credits on repeated queries for any ticker.
    - When shipping to production, disk caching can be bypassed or set with standard TTL.
    """
    def __init__(self, cache_dir: Optional[str] = None, default_ttl_seconds: int = 86400 * 7):  # Default 7 days in dev
        self.default_ttl = default_ttl_seconds
        self._memory_store: Dict[str, Dict[str, Any]] = {}
        
        # Setup disk cache directory
        if cache_dir is None:
            base_dir = Path(__file__).resolve().parent.parent.parent
            self.cache_dir = base_dir / ".cache" / "sectors"
        else:
            self.cache_dir = Path(cache_dir)
            
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_file_path(self, key: str) -> Path:
        # Create a safe filename from key hash
        safe_hash = hashlib.sha256(key.encode('utf-8')).hexdigest()[:16]
        # Clean prefix for easier inspection
        clean_prefix = "".join(c if c.isalnum() else "_" for c in key[:24]).strip("_")
        filename = f"{clean_prefix}_{safe_hash}.json"
        return self.cache_dir / filename

    def get(self, key: str) -> Optional[Any]:
        current_time = time.time()
        
        # 1. Check in-memory L1 cache
        if key in self._memory_store:
            entry = self._memory_store[key]
            if current_time <= entry["expires_at"]:
                return entry["value"]
            else:
                del self._memory_store[key]

        # 2. Check persistent disk L2 cache
        file_path = self._get_file_path(key)
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    
                expires_at = data.get("expires_at", 0)
                if current_time <= expires_at or expires_at == 0:
                    val = data.get("value")
                    # Populate memory cache for faster subsequent reads
                    self._memory_store[key] = {
                        "value": val,
                        "expires_at": expires_at
                    }
                    return val
                else:
                    # Expired disk file
                    file_path.unlink(missing_ok=True)
            except Exception as e:
                # Corrupted cache file, ignore
                pass

        return None

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        expires_at = time.time() + ttl
        
        # 1. Store in memory
        self._memory_store[key] = {
            "value": value,
            "expires_at": expires_at
        }
        
        # 2. Persist to disk
        file_path = self._get_file_path(key)
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump({
                    "key": key,
                    "expires_at": expires_at,
                    "saved_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "value": value
                }, f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    def clear(self) -> None:
        self._memory_store.clear()
        try:
            for p in self.cache_dir.glob("*.json"):
                p.unlink(missing_ok=True)
        except Exception:
            pass

# Default cache instance: persists for 7 days in dev
cache = PersistentDiskCache(default_ttl_seconds=86400 * 7)
