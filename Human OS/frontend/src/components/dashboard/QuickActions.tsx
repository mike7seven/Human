import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Plus,
  XCircle,
  RotateCcw,
  Zap,
  Inbox,
  Heart,
} from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import { modeAPI } from '@/services/api';
import { useCognitiveState } from '@/context/CognitiveStateContext';

export function QuickActions() {
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetType, setResetType] = useState<'soft' | 'hard' | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const { addToast, refreshStatus } = useCognitiveState();

  const handleReset = async (type: 'soft' | 'hard') => {
    setResetType(type);
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    if (!resetType) return;

    try {
      setIsResetting(true);
      if (resetType === 'soft') {
        await modeAPI.resetSoft();
        addToast('success', 'Soft reset complete. Nonessential threads cleared.');
      } else {
        await modeAPI.resetHard();
        addToast('success', 'Hard reset complete. Recovery mode activated.');
      }
      await refreshStatus();
    } catch {
      addToast('error', `Failed to perform ${resetType} reset`);
    } finally {
      setIsResetting(false);
      setShowResetModal(false);
      setResetType(null);
    }
  };

  return (
    <>
      <Card>
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <Link to="/focus">
            <Button
              variant="primary"
              className="w-full justify-start"
              icon={<Target className="h-4 w-4" />}
            >
              Set Focus
            </Button>
          </Link>

          <Link to="/loops">
            <Button
              variant="secondary"
              className="w-full justify-start"
              icon={<Plus className="h-4 w-4" />}
            >
              New Loop
            </Button>
          </Link>

          <Link to="/ingest">
            <Button
              variant="secondary"
              className="w-full justify-start"
              icon={<Inbox className="h-4 w-4" />}
            >
              Ingest Task
            </Button>
          </Link>

          <Link to="/emotion">
            <Button
              variant="secondary"
              className="w-full justify-start"
              icon={<Heart className="h-4 w-4" />}
            >
              Tag Emotion
            </Button>
          </Link>

          <Button
            variant="ghost"
            className="w-full justify-start"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={() => handleReset('soft')}
          >
            Soft Reset
          </Button>

          <Button
            variant="danger"
            className="w-full justify-start"
            icon={<XCircle className="h-4 w-4" />}
            onClick={() => handleReset('hard')}
          >
            Hard Reset
          </Button>
        </div>
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => {
          setShowResetModal(false);
          setResetType(null);
        }}
        title={resetType === 'soft' ? 'Soft Reset' : 'Hard Reset'}
        description={
          resetType === 'soft'
            ? 'Close all nonessential tabs and threads, focusing only on top priorities.'
            : 'Enter full recovery mode. No new input, no problem-solving until tomorrow.'
        }
        size="sm"
      >
        <div className="space-y-4">
          {resetType === 'hard' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                This will halt all non-essential cognitive processing. Only use when you're truly fried.
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowResetModal(false);
                setResetType(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={resetType === 'hard' ? 'danger' : 'primary'}
              onClick={confirmReset}
              loading={isResetting}
            >
              Confirm {resetType === 'soft' ? 'Soft' : 'Hard'} Reset
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default QuickActions;
