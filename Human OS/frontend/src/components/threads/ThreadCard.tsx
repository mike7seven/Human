import { ArrowDownToLine, X, Clock } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { formatRelativeTime } from '@/utils/helpers';
import type { Thread } from '@/types';

interface ThreadCardProps {
  thread: Thread;
  onMoveToBackground?: () => void;
  onTerminate?: () => void;
}

export function ThreadCard({
  thread,
  onMoveToBackground,
  onTerminate,
}: ThreadCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900">{thread.name}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant={thread.mode === 'foreground' ? 'action' : 'default'}
            >
              {thread.mode}
            </Badge>
            <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-100 rounded">
              {thread.time_scope.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(thread.created_at)}
            </span>
          </div>

          {thread.goal && (
            <p className="text-sm text-slate-600 mt-2">
              <span className="font-medium">Goal:</span> {thread.goal}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {thread.mode === 'foreground' && onMoveToBackground && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveToBackground}
              icon={<ArrowDownToLine className="h-4 w-4 text-slate-600" />}
              title="Move to background"
            />
          )}
          {onTerminate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onTerminate}
              icon={<X className="h-4 w-4 text-red-600" />}
              title="Terminate thread"
            />
          )}
        </div>
      </div>
    </Card>
  );
}

export default ThreadCard;
