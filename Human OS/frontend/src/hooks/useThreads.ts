import { useState, useCallback, useEffect } from 'react';
import type { Thread, ThreadSpawnRequest, ThreadBackgroundRequest, ThreadTerminateRequest } from '@/types';
import { threadAPI } from '@/services/api';

interface UseThreadsOptions {
  autoFetch?: boolean;
}

interface UseThreadsReturn {
  threads: Thread[];
  foregroundThreads: Thread[];
  backgroundThreads: Thread[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  spawn: (data: ThreadSpawnRequest) => Promise<void>;
  moveToBackground: (data: ThreadBackgroundRequest) => Promise<void>;
  terminate: (data: ThreadTerminateRequest) => Promise<void>;
}

export function useThreads(options: UseThreadsOptions = {}): UseThreadsReturn {
  const { autoFetch = true } = options;

  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchThreads = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await threadAPI.list();
      setThreads(response.data.threads || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch threads'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchThreads();
    }
  }, [autoFetch, fetchThreads]);

  const foregroundThreads = threads.filter((t) => t.mode === 'foreground' && t.status === 'active');
  const backgroundThreads = threads.filter((t) => t.mode === 'background' && t.status === 'active');

  const spawn = useCallback(async (data: ThreadSpawnRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await threadAPI.spawn(data);
      if (response.data.thread) {
        setThreads((prev) => [response.data.thread!, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to spawn thread'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const moveToBackground = useCallback(async (data: ThreadBackgroundRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await threadAPI.background(data);
      await fetchThreads();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to move thread to background'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchThreads]);

  const terminate = useCallback(async (data: ThreadTerminateRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await threadAPI.terminate(data);
      await fetchThreads();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to terminate threads'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchThreads]);

  return {
    threads,
    foregroundThreads,
    backgroundThreads,
    isLoading,
    error,
    refresh: fetchThreads,
    spawn,
    moveToBackground,
    terminate,
  };
}

export default useThreads;
