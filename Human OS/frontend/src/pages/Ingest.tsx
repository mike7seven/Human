import { Inbox } from 'lucide-react';
import { TaskIngestForm, IdeaIngestForm } from '@/components/ingest';

export function Ingest() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Inbox className="h-7 w-7 text-green-600" />
          Ingest
        </h1>
        <p className="text-slate-500 mt-1">
          Capture tasks and ideas immediately. Don't let them become open loops.
        </p>
      </div>

      {/* Forms Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TaskIngestForm />
        <IdeaIngestForm />
      </div>

      {/* Tips */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-3">Ingestion Best Practices</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">•</span>
            <span>
              <strong>Capture immediately:</strong> The longer something stays
              in your head without being recorded, the more mental bandwidth it
              consumes.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">•</span>
            <span>
              <strong>Separate tasks from ideas:</strong> Tasks have clear
              actions. Ideas need to marinate. Don't conflate them.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">•</span>
            <span>
              <strong>Be specific:</strong> "Email John about project" is better
              than "Project stuff". Clear descriptions reduce future cognitive
              load.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">•</span>
            <span>
              <strong>Review regularly:</strong> Ingested items need processing.
              Schedule time to review and either action, schedule, or archive
              them.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Ingest;
