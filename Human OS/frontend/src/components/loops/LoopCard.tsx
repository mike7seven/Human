import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Pause, Trash2 } from 'lucide-react';
import { Card, Badge, Button, Modal, Select, Textarea } from '@/components/ui';
import { useLoops } from '@/hooks/useLoops';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { formatRelativeTime } from '@/utils/helpers';
import type { Loop, ClosureType } from '@/types';

interface LoopCardProps {
  loop: Loop;
  onUpdate?: () => void;
}

const CLOSURE_OPTIONS = [
  { value: 'done', label: 'Done - Completed' },
  { value: 'paused', label: 'Paused - Will resume later' },
  { value: 'abandoned', label: 'Abandoned - Not doing this' },
];

export function LoopCard({ loop, onUpdate }: LoopCardProps) {
  const { addToast } = useCognitiveState();
  const { close, kill, isLoading } = useLoops({ autoFetch: false });
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showKillModal, setShowKillModal] = useState(false);
  const [closeData, setCloseData] = useState({
    closure_type: 'done' as ClosureType,
    next_step: '',
  });
  const [killReason, setKillReason] = useState('');

  const handleClose = async () => {
    try {
      await close({
        loop_id: loop.id,
        closure_type: closeData.closure_type,
        next_step: closeData.next_step || undefined,
      });
      addToast('success', 'Loop closed successfully');
      setShowCloseModal(false);
      onUpdate?.();
    } catch {
      addToast('error', 'Failed to close loop');
    }
  };

  const handleKill = async () => {
    if (!killReason.trim()) {
      addToast('warning', 'Please provide a reason');
      return;
    }

    try {
      await kill({
        description: loop.description,
        reason: killReason,
      });
      addToast('success', 'Loop killed');
      setShowKillModal(false);
      onUpdate?.();
    } catch {
      addToast('error', 'Failed to kill loop');
    }
  };

  const handleQuickClose = async () => {
    try {
      await close({
        loop_id: loop.id,
        closure_type: 'done',
      });
      addToast('success', 'Loop marked as done');
      onUpdate?.();
    } catch {
      addToast('error', 'Failed to close loop');
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900">{loop.description}</p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={loop.priority as 'high' | 'medium' | 'low'}>
                {loop.priority}
              </Badge>
              <Badge variant={loop.queue as 'action' | 'reference' | 'backburner'}>
                {loop.queue}
              </Badge>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(loop.created_at)}
              </span>
            </div>

            {loop.owner && (
              <p className="text-xs text-slate-500 mt-1">Owner: {loop.owner}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickClose}
              disabled={isLoading}
              icon={<CheckCircle className="h-4 w-4 text-green-600" />}
              title="Mark as done"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCloseModal(true)}
              icon={<Pause className="h-4 w-4 text-amber-600" />}
              title="Close with options"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKillModal(true)}
              icon={<XCircle className="h-4 w-4 text-red-600" />}
              title="Kill loop"
            />
          </div>
        </div>
      </Card>

      {/* Close Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Close Loop"
        description="How would you like to close this loop?"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">{loop.description}</p>
          </div>

          <Select
            label="Closure Type"
            options={CLOSURE_OPTIONS}
            value={closeData.closure_type}
            onChange={(e) =>
              setCloseData((prev) => ({
                ...prev,
                closure_type: e.target.value as ClosureType,
              }))
            }
          />

          {closeData.closure_type === 'paused' && (
            <Textarea
              label="Next Step (Optional)"
              placeholder="What's the next action when you resume?"
              value={closeData.next_step}
              onChange={(e) =>
                setCloseData((prev) => ({ ...prev, next_step: e.target.value }))
              }
              rows={2}
            />
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowCloseModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleClose}
              loading={isLoading}
            >
              Close Loop
            </Button>
          </div>
        </div>
      </Modal>

      {/* Kill Modal */}
      <Modal
        isOpen={showKillModal}
        onClose={() => setShowKillModal(false)}
        title="Kill Loop"
        description="Terminate this loop immediately. Use for unproductive rumination or non-actionable thoughts."
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{loop.description}</p>
          </div>

          <Textarea
            label="Reason for killing"
            placeholder="e.g., Non-actionable, out of my control, not worth compute"
            value={killReason}
            onChange={(e) => setKillReason(e.target.value)}
            rows={2}
          />

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowKillModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleKill}
              loading={isLoading}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Kill Loop
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default LoopCard;
