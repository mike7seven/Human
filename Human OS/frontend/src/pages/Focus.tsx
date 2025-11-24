import { Target } from 'lucide-react';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { FocusSetForm, FocusLockForm, ActiveFocus } from '@/components/focus';

export function Focus() {
  const { state } = useCognitiveState();
  const hasFocus = state.focus !== null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Target className="h-7 w-7 text-blue-600" />
          Focus
        </h1>
        <p className="text-slate-500 mt-1">
          Set your primary task and enter deep work mode. Your brain works best
          on one thing at a time.
        </p>
      </div>

      {/* Active Focus Display */}
      {hasFocus && state.focus && (
        <ActiveFocus focus={state.focus} />
      )}

      {/* Forms - only show when no active focus */}
      {!hasFocus && (
        <div className="grid lg:grid-cols-2 gap-6">
          <FocusSetForm />
          <FocusLockForm />
        </div>
      )}

      {/* Focus Tips */}
      {!hasFocus && (
        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Focus Best Practices</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                <strong>Be specific:</strong> "Write introduction paragraph" is
                better than "Work on essay"
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                <strong>Set clear success criteria:</strong> Know what "done"
                looks like before you start
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                <strong>Use the 25-50-90 rule:</strong> 25min for quick tasks,
                50min for medium tasks, 90min for deep creative work
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                <strong>Lock focus for important work:</strong> Hyperfocus mode
                helps prevent context switching
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Focus;
