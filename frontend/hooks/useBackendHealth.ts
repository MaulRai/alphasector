'use client';

import { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth } from '@/lib/api';

export function useBackendHealth() {
  const [backendOnline, setBackendOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const recheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await checkBackendHealth();
      setBackendOnline(res.status === 'healthy');
    } catch {
      setBackendOnline(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    recheck();
  }, [recheck]);

  return { backendOnline, isChecking, recheck };
}
