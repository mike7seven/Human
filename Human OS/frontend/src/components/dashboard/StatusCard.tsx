import { Activity, Brain, Zap, RefreshCw, Lightbulb, Target } from 'lucide-react';
import { Card } from '@/components/ui';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { getLoadLevelColor } from '@/utils/helpers';
import LoadIndicator from './LoadIndicator';

export function StatusCard() {
  const { state } = useCognitiveState();
  const { status } = state;

  if (!status) {
    return (
      <Card className="animate-pulse">
        <div className="h-32 bg-slate-100 rounded" />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Cognitive Status
        </h2>
        <span className="text-xs text-slate-400">
          Updated: {new Date(status.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Current Focus Banner */}
      {status.current_focus && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Active Focus</span>
            {status.focus_locked && (
              <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                Locked
              </span>
            )}
          </div>
          <p className="text-blue-800 mt-1">{status.current_focus}</p>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Emotional Load */}
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <LoadIndicator level={status.emotional_load} label="Emotional Load" size="md" />
        </div>

        {/* Energy Level */}
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="flex flex-col items-center">
            <Zap className={`h-6 w-6 mb-1 ${getLoadLevelColor(status.energy_level)}`} />
            <span className="text-xs text-slate-500">Energy</span>
            <span className={`font-semibold capitalize ${getLoadLevelColor(status.energy_level)}`}>
              {status.energy_level}
            </span>
          </div>
        </div>

        {/* Open Loops */}
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-6 w-6 mb-1 text-slate-600" />
            <span className="text-xs text-slate-500">Open Loops</span>
            <span className="text-2xl font-bold text-slate-900">
              {status.open_loops_estimate}
            </span>
          </div>
        </div>

        {/* Captured Ideas */}
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="flex flex-col items-center">
            <Lightbulb className="h-6 w-6 mb-1 text-amber-500" />
            <span className="text-xs text-slate-500">Ideas</span>
            <span className="text-2xl font-bold text-slate-900">
              {status.captured_ideas}
            </span>
          </div>
        </div>
      </div>

      {/* Thread Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Active Threads</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-slate-500">Foreground</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {status.foreground_threads.length > 0 ? (
                status.foreground_threads.slice(0, 3).map((thread, i) => (
                  <span
                    key={i}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded truncate max-w-[120px]"
                  >
                    {thread}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">None active</span>
              )}
              {status.foreground_threads.length > 3 && (
                <span className="text-xs text-slate-500">
                  +{status.foreground_threads.length - 3} more
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Background</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {status.background_threads.length > 0 ? (
                status.background_threads.slice(0, 3).map((thread, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded truncate max-w-[120px]"
                  >
                    {thread}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">None active</span>
              )}
              {status.background_threads.length > 3 && (
                <span className="text-xs text-slate-500">
                  +{status.background_threads.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default StatusCard;
