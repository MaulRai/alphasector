import time
import logging
from typing import Any, Optional, Dict
from app.db.database import SectorsCacheRepository

logger = logging.getLogger("sectors.cache")

class DatabaseApiCache:
    """
    Two-Tier Shared Cache (Fast In-Memory L1 + Persistent Neon PostgreSQL Database L2).
    
    Architecture:
    1. L1 In-Memory Cache: Blazing fast response (<0.01ms) for repeated queries in the same process.
    2. L2 Neon Database Cache: Shared across ALL users, browser tabs, and sessions.
       - Valid for 24 hours (86,400s) by default.
       - If User A queries BBRI, the result is saved to Neon DB.
       - When User B queries BBRI, the backend fetches from Neon DB (0 Sectors credit consumed).
    """
    def __init__(self, default_ttl_seconds: int = 86400):  # 24 Hours default
        self.default_ttl = default_ttl_seconds
        self._memory_store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        current_time = time.time()
        
        # 1. Check in-memory L1 cache
        if key in self._memory_store:
            entry = self._memory_store[key]
            if current_time <= entry["expires_at"]:
                return entry["value"]
            else:
                del self._memory_store[key]

        # 2. Check Neon PostgreSQL Database L2 cache
        try:
            db_data = SectorsCacheRepository.get(key)
            if db_data is not None:
                # Populate memory L1 cache for subsequent fast reads
                self._memory_store[key] = {
                    "value": db_data,
                    "expires_at": current_time + min(self.default_ttl, 3600)  # 1hr memory buffer
                }
                return db_data
        except Exception as e:
            logger.warning(f"Database cache lookup error for key '{key[:30]}': {e}")

        return None

    def get_with_metadata(self, key: str) -> Optional[Dict[str, Any]]:
        current_time = time.time()
        # 1. Check in-memory L1 cache
        if key in self._memory_store:
            entry = self._memory_store[key]
            is_expired = current_time > entry["expires_at"]
            return {
                "data": entry["value"],
                "status_code": 200,
                "created_at": None,
                "expires_at": entry["expires_at"],
                "is_expired": is_expired,
                "source": "memory"
            }

        # 2. Check Neon PostgreSQL Database L2 cache
        try:
            entry = SectorsCacheRepository.get_with_metadata(key)
            if entry:
                if not entry["is_expired"]:
                    self._memory_store[key] = {
                        "value": entry["data"],
                        "expires_at": current_time + min(self.default_ttl, 3600)
                    }
                entry["source"] = "database"
                return entry
        except Exception as e:
            logger.warning(f"Database cache get_with_metadata error for key '{key[:30]}': {e}")

        return None

    def set(
        self, 
        key: str, 
        value: Any, 
        ttl_seconds: Optional[int] = None, 
        endpoint: str = "", 
        params: Optional[Dict[str, Any]] = None,
        status_code: int = 200
    ) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        current_time = time.time()
        
        # 1. Store in memory L1
        self._memory_store[key] = {
            "value": value,
            "expires_at": current_time + ttl
        }
        
        # 2. Persist to Neon PostgreSQL Database L2
        try:
            SectorsCacheRepository.set(
                cache_key=key,
                data=value,
                endpoint=endpoint,
                params=params,
                ttl_seconds=ttl,
                status_code=status_code
            )
        except Exception as e:
            logger.warning(f"Failed to persist cache to database for key '{key[:30]}': {e}")

    def clear(self) -> None:
        self._memory_store.clear()
        try:
            SectorsCacheRepository.clear_expired()
        except Exception:
            pass

    def count_active(self) -> int:
        try:
            return SectorsCacheRepository.count_active()
        except Exception:
            return len(self._memory_store)

# Global singleton cache instance (24-Hour Default TTL)
cache = DatabaseApiCache(default_ttl_seconds=86400)
