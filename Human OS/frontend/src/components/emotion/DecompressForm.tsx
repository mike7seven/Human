import { useState } from 'react';
import { Play } from 'lucide-react';
import { Card, CardHeader, Button, Select } from '@/components/ui';
import { emotionAPI } from '@/services/api';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { DECOMPRESS_METHODS, cn } from '@/utils/helpers';
import type { EmotionDecompressRequest } from '@/types';

const DURATION_OPTIONS = [
  { value: '5m', label: '5 minutes' },
  { value: '10m', label: '10 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '20m', label: '20 minutes' },
  { value: '30m', label: '30 minutes' },
];

export function DecompressForm() {
  const { addToast } = useCognitiveState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EmotionDecompressRequest>({
    method: '',
    duration: '15m',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.method) {
      addToast('warning', 'Please select a decompression method');
      return;
    }

    try {
      setIsSubmitting(true);
      await emotionAPI.decompress(formData);
      addToast(
        'success',
        `Decompression initiated: ${formData.method} for ${formData.duration}`
      );
      setFormData({ method: '', duration: '15m' });
    } catch {
      addToast('error', 'Failed to start decompression');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Decompress"
        description="Initiate a recovery protocol when you're overloaded"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Method Selection */}
        <div>
          <label className="form-label">Decompression Method</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DECOMPRESS_METHODS.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, method: method.value }))
                }
                className={cn(
                  'p-3 rounded-lg border-2 text-center transition-all text-sm',
                  formData.method === method.value
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-slate-700'
                )}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <Select
          label="Duration"
          options={DURATION_OPTIONS}
          value={formData.duration}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, duration: e.target.value }))
          }
        />

        {/* Info Box */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
          <strong>Important:</strong> Decompression is not optional when you're
          fried. Treat it like an SRE mitigation protocol, not a luxury. The
          system needs downtime to function properly.
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full bg-green-600 hover:bg-green-700"
          loading={isSubmitting}
          icon={<Play className="h-5 w-5" />}
        >
          Start Decompression
        </Button>
      </form>
    </Card>
  );
}

export default DecompressForm;
