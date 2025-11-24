import { Cpu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Badge } from '@/components/ui';
import { useCognitiveState } from '@/context/CognitiveStateContext';

export function ThreadList() {
  const { state } = useCognitiveState();
  const { status } = state;

  if (!status) {
    return (
      <Card className="animate-pulse">
        <div className="h-24 bg-slate-100 rounded" />
      </Card>
    );
  }

  const allThreads = [
    ...status.foreground_threads.map((t) => ({ name: t, mode: 'foreground' as const })),
    ...status.background_threads.map((t) => ({ name: t, mode: 'background' as const })),
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-purple-600" />
          Active Threads
        </h3>
        <Link
          to="/threads"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {allThreads.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">
          No active threads
        </p>
      ) : (
        <div className="space-y-2">
          {/* Foreground Threads */}
          {status.foreground_threads.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Foreground ({status.foreground_threads.length})
              </p>
              <div className="space-y-1">
                {status.foreground_threads.slice(0, 3).map((thread, i) => (
                  <div
                    key={`fg-${i}`}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                  >
                    <span className="text-sm text-slate-700 truncate">{thread}</span>
                    <Badge variant="action">Active</Badge>
                  </div>
                ))}
                {status.foreground_threads.length > 3 && (
                  <p className="text-xs text-slate-400 text-center">
                    +{status.foreground_threads.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Background Threads */}
          {status.background_threads.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Background ({status.background_threads.length})
              </p>
              <div className="space-y-1">
                {status.background_threads.slice(0, 3).map((thread, i) => (
                  <div
                    key={`bg-${i}`}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                  >
                    <span className="text-sm text-slate-600 truncate">{thread}</span>
                    <Badge variant="default">Background</Badge>
                  </div>
                ))}
                {status.background_threads.length > 3 && (
                  <p className="text-xs text-slate-400 text-center">
                    +{status.background_threads.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default ThreadList;
