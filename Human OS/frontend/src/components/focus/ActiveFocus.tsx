import { useState, useEffect } from 'react';
import { Target, Zap, Clock, X, CheckCircle, Maximize2 } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { focusAPI } from '@/services/api';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { formatDuration, parseDuration } from '@/utils/helpers';
import type { FocusState } from '@/types';

interface ActiveFocusProps {
  focus: FocusState;
}

export function ActiveFocus({ focus }: ActiveFocusProps) {
  const { addToast, dispatch } = useCognitiveState();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Calculate initial time remaining
    const duration = parseDuration(focus.duration);
    const startTime = new Date(focus.started_at).getTime();
    const elapsed = Date.now() - startTime;
    setTimeRemaining(Math.max(0, duration - elapsed));
  }, [focus]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = Math.max(0, prev - 1000);
          if (newTime === 0 && prev > 0) {
            // Timer just finished
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Focus Session Complete!', {
                body: `Time to take a break. You finished: ${focus.task_name}`,
                icon: '/favicon.ico',
              });
            }
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, focus.task_name]);

  const handleClearFocus = async () => {
    try {
      setIsClearing(true);
      await focusAPI.clearFocus();
      dispatch({ type: 'SET_FOCUS', payload: null });
      addToast('success', 'Focus session ended');
    } catch {
      addToast('error', 'Failed to clear focus');
    } finally {
      setIsClearing(false);
    }
  };

  const progress = Math.min(
    100,
    ((parseDuration(focus.duration) - timeRemaining) / parseDuration(focus.duration)) * 100
  );

  const isComplete = timeRemaining === 0;

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-8">
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="h-8 w-8" />
        </button>

        {focus.is_locked && (
          <div className="flex items-center gap-2 text-amber-400 mb-4">
            <Zap className="h-6 w-6" />
            <span className="font-medium">HYPERFOCUS ACTIVE</span>
          </div>
        )}

        <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-8">
          {focus.task_name}
        </h1>

        <div className="text-8xl md:text-[12rem] font-mono font-bold text-white tracking-wider">
          {formatDuration(timeRemaining)}
        </div>

        <p className="text-slate-400 mt-8 text-lg">
          {isComplete ? 'Session Complete!' : 'Time remaining'}
        </p>

        {isComplete && (
          <Button
            variant="primary"
            size="lg"
            className="mt-8"
            onClick={handleClearFocus}
            icon={<CheckCircle className="h-5 w-5" />}
          >
            Complete Session
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card
      className={`${
        focus.is_locked ? 'border-2 border-amber-400' : 'border-2 border-blue-400'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {focus.is_locked ? (
            <Zap className="h-5 w-5 text-amber-600" />
          ) : (
            <Target className="h-5 w-5 text-blue-600" />
          )}
          <h3 className="font-semibold text-slate-900">
            {focus.is_locked ? 'Hyperfocus Active' : 'Focus Active'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(true)}
            icon={<Maximize2 className="h-4 w-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFocus}
            loading={isClearing}
            icon={<X className="h-4 w-4" />}
          >
            End
          </Button>
        </div>
      </div>

      {/* Task Name */}
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{focus.task_name}</h2>

      {/* Success Criteria */}
      <p className="text-slate-600 mb-6">
        <span className="font-medium">Done when:</span> {focus.success_criteria}
      </p>

      {/* Timer Display */}
      <div className="text-center py-8">
        <div
          className={`text-6xl font-mono font-bold tracking-wider ${
            isComplete ? 'text-green-600' : 'text-slate-900'
          }`}
        >
          {formatDuration(timeRemaining)}
        </div>
        <p className="text-slate-500 mt-2">
          {isComplete ? 'Session Complete!' : 'remaining'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
        <div
          className={`rounded-full h-3 transition-all duration-1000 ${
            focus.is_locked ? 'bg-amber-500' : 'bg-blue-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Duration info */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {focus.duration} session
        </span>
        <span>{Math.round(progress)}% complete</span>
      </div>

      {/* Locked mode info */}
      {focus.is_locked && focus.fallback && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-slate-600">
            <span className="font-medium">Recovery action:</span> {focus.fallback}
          </p>
        </div>
      )}

      {/* Complete button when done */}
      {isComplete && (
        <Button
          variant="primary"
          className="w-full mt-4"
          onClick={handleClearFocus}
          loading={isClearing}
          icon={<CheckCircle className="h-5 w-5" />}
          size="lg"
        >
          Mark as Complete
        </Button>
      )}
    </Card>
  );
}

export default ActiveFocus;
