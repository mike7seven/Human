import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, Button, Textarea, Select } from '@/components/ui';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { useLoops } from '@/hooks/useLoops';
import type { LoopAuthorizeRequest, Priority, QueueType } from '@/types';

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High - Needs attention today' },
  { value: 'medium', label: 'Medium - Important but not urgent' },
  { value: 'low', label: 'Low - Can wait' },
];

const QUEUE_OPTIONS = [
  { value: 'action', label: 'Action - Execute now or today' },
  { value: 'reference', label: 'Reference - Information only' },
  { value: 'backburner', label: 'Backburner - Someday maybe' },
];

const OWNER_OPTIONS = [
  { value: 'me now', label: 'Me - Now' },
  { value: 'me later', label: 'Me - Later' },
  { value: 'offload', label: 'Offload to AI/other' },
  { value: 'waiting', label: 'Waiting on someone' },
];

interface LoopAuthorizeFormProps {
  onSuccess?: () => void;
}

export function LoopAuthorizeForm({ onSuccess }: LoopAuthorizeFormProps) {
  const { addToast } = useCognitiveState();
  const { authorize, isLoading } = useLoops({ autoFetch: false });
  const [formData, setFormData] = useState<LoopAuthorizeRequest>({
    description: '',
    priority: 'medium' as Priority,
    queue: 'action' as QueueType,
    owner: 'me now',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      addToast('warning', 'Please enter a description');
      return;
    }

    try {
      await authorize(formData);
      addToast('success', 'Loop authorized and added to queue');
      setFormData({
        description: '',
        priority: 'medium',
        queue: 'action',
        owner: 'me now',
      });
      onSuccess?.();
    } catch {
      addToast('error', 'Failed to authorize loop');
    }
  };

  return (
    <Card>
      <CardHeader
        title="Authorize New Loop"
        description="Explicitly log a new task or thought to prevent it from consuming background resources"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Description"
          placeholder="What's the loop about?"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={formData.priority}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                priority: e.target.value as Priority,
              }))
            }
          />

          <Select
            label="Queue"
            options={QUEUE_OPTIONS}
            value={formData.queue}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                queue: e.target.value as QueueType,
              }))
            }
          />
        </div>

        <Select
          label="Owner"
          options={OWNER_OPTIONS}
          value={formData.owner}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, owner: e.target.value }))
          }
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isLoading}
          icon={<Plus className="h-5 w-5" />}
        >
          Authorize Loop
        </Button>
      </form>
    </Card>
  );
}

export default LoopAuthorizeForm;
