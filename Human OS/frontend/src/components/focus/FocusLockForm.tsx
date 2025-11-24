import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Card, CardHeader, Button, Input, Select } from '@/components/ui';
import { focusAPI } from '@/services/api';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import type { FocusLockRequest } from '@/types';

const TIMEBOX_OPTIONS = [
  { value: '30m', label: '30 minutes' },
  { value: '45m', label: '45 minutes' },
  { value: '60m', label: '1 hour' },
  { value: '90m', label: '90 minutes' },
  { value: '120m', label: '2 hours' },
];

const FALLBACK_OPTIONS = [
  { value: 'walk', label: 'Take a walk' },
  { value: 'water', label: 'Get water & stretch' },
  { value: 'rest', label: 'Rest eyes (5 min)' },
  { value: 'snack', label: 'Healthy snack' },
  { value: 'outside', label: 'Step outside' },
];

export function FocusLockForm() {
  const { addToast, dispatch } = useCognitiveState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FocusLockRequest>({
    task_name: '',
    timebox: '60m',
    fallback: 'walk',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.task_name.trim()) {
      addToast('warning', 'Please enter a task name');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await focusAPI.lockFocus(formData);

      if (response.data.focus) {
        dispatch({ type: 'SET_FOCUS', payload: response.data.focus });
      }

      addToast('success', `Hyperfocus locked on "${formData.task_name}"`);

      setFormData({
        task_name: '',
        timebox: '60m',
        fallback: 'walk',
      });
    } catch {
      addToast('error', 'Failed to lock focus. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Lock Focus"
        description="Enter hyperfocus mode - block all distractions"
      />

      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 text-amber-800">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">Hyperfocus Mode</span>
        </div>
        <p className="text-xs text-amber-700 mt-1">
          This mode intentionally limits context switching. The fallback action
          will be enforced when the timebox ends.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Name */}
        <Input
          label="Task Name"
          placeholder="What requires deep focus?"
          value={formData.task_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, task_name: e.target.value }))
          }
        />

        {/* Timebox */}
        <Select
          label="Maximum Duration"
          options={TIMEBOX_OPTIONS}
          value={formData.timebox}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, timebox: e.target.value }))
          }
          helperText="Set a limit to avoid burnout"
        />

        {/* Fallback */}
        <Select
          label="Recovery Action"
          options={FALLBACK_OPTIONS}
          value={formData.fallback}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, fallback: e.target.value }))
          }
          helperText="What you'll do when the lock ends"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full bg-amber-600 hover:bg-amber-700"
          loading={isSubmitting}
          icon={<Zap className="h-5 w-5" />}
          size="lg"
        >
          Enter Hyperfocus
        </Button>
      </form>
    </Card>
  );
}

export default FocusLockForm;
