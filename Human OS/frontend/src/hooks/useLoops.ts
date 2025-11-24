import { useState, useCallback, useEffect } from 'react';
import type { Loop, LoopAuthorizeRequest, LoopCloseRequest, LoopKillRequest } from '@/types';
import { loopAPI } from '@/services/api';

interface UseLoopsOptions {
  autoFetch?: boolean;
  queue?: string;
}

interface UseLoopsReturn {
  loops: Loop[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  authorize: (data: LoopAuthorizeRequest) => Promise<void>;
  close: (data: LoopCloseRequest) => Promise<void>;
  kill: (data: LoopKillRequest) => Promise<void>;
}

export function useLoops(options: UseLoopsOptions = {}): UseLoopsReturn {
  const { autoFetch = true, queue } = options;

  const [loops, setLoops] = useState<Loop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLoops = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await loopAPI.list(queue);
      setLoops(response.data.loops || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch loops'));
    } finally {
      setIsLoading(false);
    }
  }, [queue]);

  useEffect(() => {
    if (autoFetch) {
      fetchLoops();
    }
  }, [autoFetch, fetchLoops]);

  const authorize = useCallback(async (data: LoopAuthorizeRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await loopAPI.authorize(data);
      if (response.data.loop) {
        setLoops((prev) => [response.data.loop!, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to authorize loop'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const close = useCallback(async (data: LoopCloseRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await loopAPI.close(data);
      setLoops((prev) => prev.filter((loop) => loop.id !== data.loop_id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to close loop'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const kill = useCallback(async (data: LoopKillRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await loopAPI.kill(data);
      // Loop was killed, refresh the list
      await fetchLoops();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to kill loop'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchLoops]);

  return {
    loops,
    isLoading,
    error,
    refresh: fetchLoops,
    authorize,
    close,
    kill,
  };
}

export default useLoops;
