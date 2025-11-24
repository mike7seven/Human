import { RefreshCw, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '@/components/ui';
import { useLoops } from '@/hooks/useLoops';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { formatRelativeTime } from '@/utils/helpers';

export function LoopList() {
  const { loops, isLoading, close } = useLoops();
  const { addToast } = useCognitiveState();

  const handleQuickClose = async (loopId: string) => {
    try {
      await close({
        loop_id: loopId,
        closure_type: 'done',
      });
      addToast('success', 'Loop closed successfully');
    } catch {
      addToast('error', 'Failed to close loop');
    }
  };

  const openLoops = loops.filter((l) => l.status === 'open');

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-amber-600" />
          Open Loops
          {openLoops.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {openLoops.length}
            </span>
          )}
        </h3>
        <Link
          to="/loops"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Manage <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading && openLoops.length === 0 ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg" />
          ))}
        </div>
      ) : openLoops.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">
          No open loops - your mind is clear!
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
          {openLoops.slice(0, 5).map((loop) => (
            <div
              key={loop.id}
              className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {loop.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={loop.priority as 'high' | 'medium' | 'low'}>
                      {loop.priority}
                    </Badge>
                    <Badge variant={loop.queue as 'action' | 'reference' | 'backburner'}>
                      {loop.queue}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(loop.created_at)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickClose(loop.id)}
                  icon={<CheckCircle className="h-4 w-4 text-green-600" />}
                  title="Close loop"
                />
              </div>
            </div>
          ))}

          {openLoops.length > 5 && (
            <Link
              to="/loops"
              className="block text-center text-sm text-slate-500 hover:text-slate-700 py-2"
            >
              View {openLoops.length - 5} more loops
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}

export default LoopList;
