import { useState, useEffect, useCallback, useRef } from 'react';
import type { FocusState, FocusSetRequest, FocusLockRequest } from '@/types';
import { focusAPI } from '@/services/api';
import { parseDuration } from '@/utils/helpers';

interface UseFocusReturn {
  focus: FocusState | null;
  isLoading: boolean;
  error: Error | null;
  timeRemaining: number;
  isActive: boolean;
  setFocus: (data: FocusSetRequest) => Promise<void>;
  lockFocus: (data: FocusLockRequest) => Promise<void>;
  clearFocus: () => Promise<void>;
}

export function useFocus(): UseFocusReturn {
  const [focus, setFocusState] = useState<FocusState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = focus !== null && timeRemaining > 0;

  // Calculate time remaining based on focus state
  const calculateTimeRemaining = useCallback((focusState: FocusState) => {
    if (focusState.ends_at) {
      const endsAt = new Date(focusState.ends_at).getTime();
      const now = Date.now();
      return Math.max(0, endsAt - now);
    }
    return parseDuration(focusState.duration);
  }, []);

  // Update timer every second
  useEffect(() => {
    if (focus && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1000) {
            // Timer ended
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            // Notify user
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Focus Session Complete', {
                body: `Your focus session on "${focus.task_name}" has ended.`,
                icon: '/favicon.ico',
              });
            }
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [focus, timeRemaining]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const setFocus = useCallback(async (data: FocusSetRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await focusAPI.setFocus(data);
      if (response.data.focus) {
        setFocusState(response.data.focus);
        setTimeRemaining(calculateTimeRemaining(response.data.focus));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to set focus'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [calculateTimeRemaining]);

  const lockFocus = useCallback(async (data: FocusLockRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await focusAPI.lockFocus(data);
      if (response.data.focus) {
        setFocusState(response.data.focus);
        setTimeRemaining(calculateTimeRemaining(response.data.focus));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to lock focus'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [calculateTimeRemaining]);

  const clearFocus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await focusAPI.clearFocus();
      setFocusState(null);
      setTimeRemaining(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to clear focus'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    focus,
    isLoading,
    error,
    timeRemaining,
    isActive,
    setFocus,
    lockFocus,
    clearFocus,
  };
}

export default useFocus;
