import { useState } from 'react';
import { Cpu, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button, Modal, Card } from '@/components/ui';
import { ThreadSpawnForm, ThreadCard } from '@/components/threads';
import { useThreads } from '@/hooks/useThreads';
import { useCognitiveState } from '@/context/CognitiveStateContext';

export function Threads() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminateRule, setTerminateRule] = useState('');
  const { addToast } = useCognitiveState();
  const {
    foregroundThreads,
    backgroundThreads,
    isLoading,
    refresh,
    moveToBackground,
    terminate,
  } = useThreads();

  const handleTerminateAll = async () => {
    if (!terminateRule.trim()) {
      addToast('warning', 'Please enter a termination rule');
      return;
    }

    try {
      await terminate({ rule: terminateRule });
      addToast('success', 'Threads terminated');
      setShowTerminateModal(false);
      setTerminateRule('');
    } catch {
      addToast('error', 'Failed to terminate threads');
    }
  };

  const handleMoveToBackground = async (threadName: string) => {
    try {
      await moveToBackground({
        thread_name: threadName,
        goal: 'Continue processing in background',
      });
      addToast('success', `"${threadName}" moved to background`);
    } catch {
      addToast('error', 'Failed to move thread to background');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="h-7 w-7 text-purple-600" />
            Threads
          </h1>
          <p className="text-slate-500 mt-1">
            Manage cognitive processes running in foreground and background.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={refresh}
            loading={isLoading}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowTerminateModal(true)}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Terminate
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowNewModal(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            New Thread
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <span className="text-3xl font-bold text-blue-700">
            {foregroundThreads.length}
          </span>
          <p className="text-sm text-blue-600">Foreground Threads</p>
          <p className="text-xs text-blue-500 mt-1">Active attention</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <span className="text-3xl font-bold text-slate-700">
            {backgroundThreads.length}
          </span>
          <p className="text-sm text-slate-600">Background Threads</p>
          <p className="text-xs text-slate-500 mt-1">Passive processing</p>
        </div>
      </div>

      {/* Foreground Threads */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Foreground Threads
        </h2>
        {foregroundThreads.length === 0 ? (
          <Card>
            <p className="text-slate-500 text-center py-4">
              No foreground threads active
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {foregroundThreads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onMoveToBackground={() => handleMoveToBackground(thread.name)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Background Threads */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Background Threads
        </h2>
        {backgroundThreads.length === 0 ? (
          <Card>
            <p className="text-slate-500 text-center py-4">
              No background threads active
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {backgroundThreads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        )}
      </div>

      {/* New Thread Modal */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Spawn New Thread"
        size="lg"
      >
        <ThreadSpawnForm
          onSuccess={() => {
            setShowNewModal(false);
            refresh();
          }}
        />
      </Modal>

      {/* Terminate Modal */}
      <Modal
        isOpen={showTerminateModal}
        onClose={() => setShowTerminateModal(false)}
        title="Terminate Threads"
        description="Specify which threads to terminate"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              This will terminate threads matching your rule. Use when you feel
              overloaded and need to reduce cognitive load.
            </p>
          </div>

          <div>
            <label className="form-label">Termination Rule</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., keep only today's tasks, kill all future planning"
              value={terminateRule}
              onChange={(e) => setTerminateRule(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Describe which threads to keep or terminate
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowTerminateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleTerminateAll}
              loading={isLoading}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Terminate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Threads;
