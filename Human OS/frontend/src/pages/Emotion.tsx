import { Heart } from 'lucide-react';
import { EmotionTagForm, DecompressForm } from '@/components/emotion';

export function Emotion() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Heart className="h-7 w-7 text-red-500" />
          Emotion
        </h1>
        <p className="text-slate-500 mt-1">
          Tag and process emotions. Decompression is essential for system
          maintenance.
        </p>
      </div>

      {/* Forms Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <EmotionTagForm />
        <DecompressForm />
      </div>

      {/* Emotional Regulation Tips */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-3">
          Understanding Emotional Load
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-green-50 rounded-lg">
            <span className="font-medium text-green-800">Low Load</span>
            <p className="text-green-700 text-xs mt-1">
              System running smoothly. Good time for challenging work. Maintain
              current practices.
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <span className="font-medium text-amber-800">Medium Load</span>
            <p className="text-amber-700 text-xs mt-1">
              Elevated stress. Tag and identify sources. Consider closing
              non-essential loops.
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <span className="font-medium text-red-800">High Load</span>
            <p className="text-red-700 text-xs mt-1">
              System overloaded. Priority: decompression. Reduce input, increase
              recovery time.
            </p>
          </div>
        </div>
      </div>

      {/* Why Tag Emotions */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-3">Why Tag Emotions?</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            <span>
              <strong>Labeling reduces intensity:</strong> Research shows that
              naming an emotion engages the prefrontal cortex and reduces
              amygdala activation.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            <span>
              <strong>Source identification prevents rumination:</strong> When
              you know why you feel something, your brain stops searching for
              answers in the background.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            <span>
              <strong>Emotions are data:</strong> They're telling you something
              important about your environment, relationships, or decisions.
              Listen to them.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            <span>
              <strong>Prevents emotional loops:</strong> Unprocessed emotions
              become open loops that drain cognitive resources.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Emotion;
