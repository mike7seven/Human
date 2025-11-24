import { useState } from 'react';
import { Target, Clock } from 'lucide-react';
import { Card, CardHeader, Button, Input, Textarea } from '@/components/ui';
import { focusAPI } from '@/services/api';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { FOCUS_DURATIONS } from '@/utils/helpers';
import type { FocusSetRequest } from '@/types';

export function FocusSetForm() {
  const { addToast, dispatch } = useCognitiveState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FocusSetRequest>({
    task_name: '',
    duration: '25m',
    success_criteria: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.task_name.trim() || !formData.success_criteria.trim()) {
      addToast('warning', 'Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await focusAPI.setFocus(formData);

      if (response.data.focus) {
        dispatch({ type: 'SET_FOCUS', payload: response.data.focus });
      }

      addToast('success', `Focus set on "${formData.task_name}" for ${formData.duration}`);

      // Reset form
      setFormData({
        task_name: '',
        duration: '25m',
        success_criteria: '',
      });
    } catch {
      addToast('error', 'Failed to set focus. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Set Focus"
        description="Define your primary task and criteria for success"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Name */}
        <Input
          label="Task Name"
          placeholder="e.g., Draft project proposal"
          value={formData.task_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, task_name: e.target.value }))
          }
          helperText="What are you working on?"
        />

        {/* Duration Selection */}
        <div>
          <label className="form-label flex items-center gap-1">
            <Clock className="h-4 w-4 text-slate-400" />
            Duration
          </label>
          <div className="grid grid-cols-4 gap-2">
            {FOCUS_DURATIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, duration: option.value }))
                }
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  formData.duration === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="block font-semibold">{option.label}</span>
                <span className="text-xs text-slate-500">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Success Criteria */}
        <Textarea
          label="Success Criteria"
          placeholder="e.g., First draft complete with outline and key points"
          value={formData.success_criteria}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              success_criteria: e.target.value,
            }))
          }
          rows={3}
          helperText="What does 'done' look like for this session?"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isSubmitting}
          icon={<Target className="h-5 w-5" />}
          size="lg"
        >
          Start Focus Session
        </Button>
      </form>
    </Card>
  );
}

export default FocusSetForm;
