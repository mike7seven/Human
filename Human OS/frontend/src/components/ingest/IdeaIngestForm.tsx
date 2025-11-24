import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Card, CardHeader, Button, Textarea, Select } from '@/components/ui';
import { ingestAPI } from '@/services/api';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { IDEA_STORAGE_OPTIONS } from '@/utils/helpers';
import type { IngestIdeaRequest } from '@/types';

export function IdeaIngestForm() {
  const { addToast } = useCognitiveState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<IngestIdeaRequest>({
    idea_summary: '',
    storage: 'logbook',
    action_now: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.idea_summary.trim()) {
      addToast('warning', 'Please enter an idea summary');
      return;
    }

    try {
      setIsSubmitting(true);
      await ingestAPI.idea(formData);
      addToast('success', 'Idea captured successfully');
      setFormData({
        idea_summary: '',
        storage: 'logbook',
        action_now: false,
      });
    } catch {
      addToast('error', 'Failed to capture idea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Capture Idea"
        description="Log a spark without turning it into a task"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Idea Summary"
          placeholder="What's the idea?"
          value={formData.idea_summary}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, idea_summary: e.target.value }))
          }
          rows={4}
        />

        <Select
          label="Storage Location"
          options={IDEA_STORAGE_OPTIONS}
          value={formData.storage}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, storage: e.target.value }))
          }
          helperText="Where should this be stored for later?"
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="action_now"
            checked={formData.action_now}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, action_now: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="action_now" className="text-sm text-slate-700">
            Requires action now (will create a task)
          </label>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <strong>Remember:</strong> Not every idea needs to become a task. The
          goal is to capture the spark without letting it consume mental resources.
          Let ideas marinate in the background.
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full bg-amber-600 hover:bg-amber-700"
          loading={isSubmitting}
          icon={<Lightbulb className="h-5 w-5" />}
        >
          Capture Idea
        </Button>
      </form>
    </Card>
  );
}

export default IdeaIngestForm;
