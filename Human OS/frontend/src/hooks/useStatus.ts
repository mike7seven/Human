import { useState, useEffect, useCallback } from 'react';
import type { CognitiveStatus } from '@/types';
import { dashboardAPI } from '@/services/api';

interface UseStatusOptions {
  pollingInterval?: number;
  enabled?: boolean;
}

interface UseStatusReturn {
  status: CognitiveStatus | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useStatus(options: UseStatusOptions = {}): UseStatusReturn {
  const { pollingInterval = 5000, enabled = true } = options;

  const [status, setStatus] = useState<CognitiveStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await dashboardAPI.getStatus();
      setStatus(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch status'));
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchStatus();

    if (pollingInterval > 0 && enabled) {
      const interval = setInterval(fetchStatus, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStatus, pollingInterval, enabled]);

  return {
    status,
    isLoading,
    error,
    refresh: fetchStatus,
  };
}

export default useStatus;
