import { useState } from 'react';
import { Cpu } from 'lucide-react';
import { Card, CardHeader, Button, Input, Select } from '@/components/ui';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { useThreads } from '@/hooks/useThreads';
import { TIME_SCOPES } from '@/utils/helpers';
import type { ThreadSpawnRequest, ThreadMode } from '@/types';

const MODE_OPTIONS = [
  { value: 'foreground', label: 'Foreground - Active attention' },
  { value: 'background', label: 'Background - Passive processing' },
];

interface ThreadSpawnFormProps {
  onSuccess?: () => void;
}

export function ThreadSpawnForm({ onSuccess }: ThreadSpawnFormProps) {
  const { addToast } = useCognitiveState();
  const { spawn, isLoading } = useThreads({ autoFetch: false });
  const [formData, setFormData] = useState<ThreadSpawnRequest>({
    thread_name: '',
    mode: 'foreground' as ThreadMode,
    time_scope: 'today',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.thread_name.trim()) {
      addToast('warning', 'Please enter a thread name');
      return;
    }

    try {
      await spawn(formData);
      addToast(
        'success',
        `${formData.mode === 'foreground' ? 'Foreground' : 'Background'} thread spawned`
      );
      setFormData({
        thread_name: '',
        mode: 'foreground',
        time_scope: 'today',
      });
      onSuccess?.();
    } catch {
      addToast('error', 'Failed to spawn thread');
    }
  };

  return (
    <Card>
      <CardHeader
        title="Spawn New Thread"
        description="Intentionally allocate cognitive resources to a specific task or thought process"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Thread Name"
          placeholder="What should your brain work on?"
          value={formData.thread_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, thread_name: e.target.value }))
          }
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label="Mode"
            options={MODE_OPTIONS}
            value={formData.mode}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                mode: e.target.value as ThreadMode,
              }))
            }
          />

          <Select
            label="Time Scope"
            options={TIME_SCOPES}
            value={formData.time_scope}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, time_scope: e.target.value }))
            }
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isLoading}
          icon={<Cpu className="h-5 w-5" />}
        >
          Spawn Thread
        </Button>
      </form>
    </Card>
  );
}

export default ThreadSpawnForm;
