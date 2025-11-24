import { useState, useEffect } from 'react';
import { Target, Pause, Play, X, Zap } from 'lucide-react';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import { formatDuration, parseDuration } from '@/utils/helpers';
import type { FocusState } from '@/types';

interface FocusTimerProps {
  focus: FocusState | null;
  onClear?: () => void;
}

export function FocusTimer({ focus, onClear }: FocusTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (focus) {
      const duration = parseDuration(focus.duration);
      const startTime = new Date(focus.started_at).getTime();
      const elapsed = Date.now() - startTime;
      setTimeRemaining(Math.max(0, duration - elapsed));
    }
  }, [focus]);

  useEffect(() => {
    if (timeRemaining > 0 && !isPaused) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, isPaused]);

  if (!focus) {
    return (
      <Card className="text-center py-8">
        <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No active focus session</p>
        <p className="text-slate-400 text-xs mt-1">
          Set a focus to start tracking your work
        </p>
      </Card>
    );
  }

  const progress = focus
    ? ((parseDuration(focus.duration) - timeRemaining) / parseDuration(focus.duration)) * 100
    : 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Active Focus</h3>
          {focus.is_locked && (
            <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
              <Zap className="h-3 w-3" />
              Locked
            </span>
          )}
        </div>
        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            icon={<X className="h-4 w-4" />}
          >
            End
          </Button>
        )}
      </div>

      {/* Task Name */}
      <h2 className="text-xl font-bold text-slate-900 mb-2">{focus.task_name}</h2>

      {/* Success Criteria */}
      <p className="text-sm text-slate-600 mb-4">
        <span className="font-medium">Done when:</span> {focus.success_criteria}
      </p>

      {/* Timer Display */}
      <div className="text-center py-6">
        <div className="text-5xl font-mono font-bold text-slate-900 tracking-wider">
          {formatDuration(timeRemaining)}
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {timeRemaining > 0 ? 'remaining' : 'Time complete!'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 rounded-full h-2 transition-all duration-1000"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsPaused(!isPaused)}
          icon={isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
      </div>

      {/* Fallback info if locked */}
      {focus.is_locked && focus.fallback && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-slate-500">
            <span className="font-medium">Fallback:</span> {focus.fallback}
          </p>
        </div>
      )}
    </Card>
  );
}

export default FocusTimer;
