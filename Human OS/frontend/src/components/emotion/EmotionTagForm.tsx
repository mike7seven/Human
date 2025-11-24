import { useState } from 'react';
import { Tag } from 'lucide-react';
import { Card, CardHeader, Button, Input } from '@/components/ui';
import { emotionAPI } from '@/services/api';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { EMOTIONS, cn } from '@/utils/helpers';
import type { EmotionTagRequest } from '@/types';

export function EmotionTagForm() {
  const { addToast } = useCognitiveState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EmotionTagRequest>({
    label: '',
    source_guess: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label) {
      addToast('warning', 'Please select an emotion');
      return;
    }

    if (!formData.source_guess.trim()) {
      addToast('warning', 'Please enter your best guess for the source');
      return;
    }

    try {
      setIsSubmitting(true);
      await emotionAPI.tag(formData);
      addToast('success', 'Emotion tagged successfully');
      setFormData({ label: '', source_guess: '' });
    } catch {
      addToast('error', 'Failed to tag emotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Tag Emotion"
        description="Label what you're feeling to transform it from raw signal into data"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Emotion Grid */}
        <div>
          <label className="form-label">How are you feeling?</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, label: emotion.value }))
                }
                className={cn(
                  'p-3 rounded-lg border-2 text-center transition-all',
                  formData.label === emotion.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="text-2xl block mb-1">{emotion.icon}</span>
                <span className="text-xs text-slate-700">{emotion.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Source Guess */}
        <Input
          label="Source Guess"
          placeholder="What do you think is causing this?"
          value={formData.source_guess}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, source_guess: e.target.value }))
          }
          helperText="Your best hypothesis about the origin"
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isSubmitting}
          icon={<Tag className="h-5 w-5" />}
        >
          Tag Emotion
        </Button>
      </form>
    </Card>
  );
}

export default EmotionTagForm;
