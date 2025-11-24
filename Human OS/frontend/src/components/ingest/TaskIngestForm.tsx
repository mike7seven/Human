import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { Card, CardHeader, Button, Textarea, Select } from '@/components/ui';
import { ingestAPI } from '@/services/api';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { TASK_CATEGORIES } from '@/utils/helpers';
import type { IngestTaskRequest, Priority } from '@/types';

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function TaskIngestForm() {
  const { addToast } = useCognitiveState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<IngestTaskRequest>({
    description: '',
    category: 'work',
    urgency: 'medium' as Priority,
    importance: 'medium' as Priority,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      addToast('warning', 'Please enter a task description');
      return;
    }

    try {
      setIsSubmitting(true);
      await ingestAPI.task(formData);
      addToast('success', 'Task ingested and queued for processing');
      setFormData({
        description: '',
        category: 'work',
        urgency: 'medium',
        importance: 'medium',
      });
    } catch {
      addToast('error', 'Failed to ingest task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Ingest Task"
        description="Capture a new task for processing"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Task Description"
          placeholder="What needs to be done?"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
        />

        <Select
          label="Category"
          options={TASK_CATEGORIES}
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category: e.target.value }))
          }
        />

        {/* Urgency/Importance Matrix */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Urgency"
            options={PRIORITY_OPTIONS}
            value={formData.urgency}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                urgency: e.target.value as Priority,
              }))
            }
            helperText="How soon?"
          />

          <Select
            label="Importance"
            options={PRIORITY_OPTIONS}
            value={formData.importance}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                importance: e.target.value as Priority,
              }))
            }
            helperText="How much does it matter?"
          />
        </div>

        {/* Eisenhower Matrix Hint */}
        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
          <strong>Quick Guide:</strong>
          <ul className="mt-1 space-y-0.5">
            <li>• High urgency + High importance = Do now</li>
            <li>• Low urgency + High importance = Schedule</li>
            <li>• High urgency + Low importance = Delegate/Minimize</li>
            <li>• Low urgency + Low importance = Backburner</li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isSubmitting}
          icon={<CheckSquare className="h-5 w-5" />}
        >
          Ingest Task
        </Button>
      </form>
    </Card>
  );
}

export default TaskIngestForm;
