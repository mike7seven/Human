import { useState } from 'react';
import { RefreshCw, Plus, Filter } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { LoopAuthorizeForm, LoopCard } from '@/components/loops';
import { useLoops } from '@/hooks/useLoops';
import type { QueueType } from '@/types';

const QUEUE_FILTERS: { value: QueueType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Queues' },
  { value: 'action', label: 'Action' },
  { value: 'reference', label: 'Reference' },
  { value: 'backburner', label: 'Backburner' },
];

export function Loops() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [queueFilter, setQueueFilter] = useState<QueueType | 'all'>('all');
  const { loops, isLoading, refresh } = useLoops();

  const openLoops = loops.filter((l) => l.status === 'open');
  const filteredLoops =
    queueFilter === 'all'
      ? openLoops
      : openLoops.filter((l) => l.queue === queueFilter);

  const loopsByQueue = {
    action: openLoops.filter((l) => l.queue === 'action'),
    reference: openLoops.filter((l) => l.queue === 'reference'),
    backburner: openLoops.filter((l) => l.queue === 'backburner'),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw className="h-7 w-7 text-amber-600" />
            Open Loops
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your open commitments. Close loops to free mental bandwidth.
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
            variant="primary"
            onClick={() => setShowNewModal(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            New Loop
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <span className="text-2xl font-bold text-blue-700">
            {loopsByQueue.action.length}
          </span>
          <p className="text-sm text-blue-600">Action Queue</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <span className="text-2xl font-bold text-purple-700">
            {loopsByQueue.reference.length}
          </span>
          <p className="text-sm text-purple-600">Reference</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <span className="text-2xl font-bold text-slate-700">
            {loopsByQueue.backburner.length}
          </span>
          <p className="text-sm text-slate-600">Backburner</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <Filter className="h-4 w-4 text-slate-400" />
        {QUEUE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setQueueFilter(filter.value)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              queueFilter === filter.value
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {filter.label}
            {filter.value !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({loopsByQueue[filter.value as QueueType].length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loops List */}
      {isLoading && filteredLoops.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse h-24 bg-slate-100 rounded-lg"
            />
          ))}
        </div>
      ) : filteredLoops.length === 0 ? (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            {queueFilter === 'all'
              ? 'No open loops. Your mind is clear!'
              : `No loops in ${queueFilter} queue`}
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => setShowNewModal(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Create New Loop
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLoops.map((loop) => (
            <LoopCard key={loop.id} loop={loop} onUpdate={refresh} />
          ))}
        </div>
      )}

      {/* New Loop Modal */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Authorize New Loop"
        size="lg"
      >
        <LoopAuthorizeForm
          onSuccess={() => {
            setShowNewModal(false);
            refresh();
          }}
        />
      </Modal>
    </div>
  );
}

export default Loops;
