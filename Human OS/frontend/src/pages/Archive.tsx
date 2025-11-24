import { Archive as ArchiveIcon, GitCommit, Book } from 'lucide-react';
import { CommitForm } from '@/components/archive';
import { Card } from '@/components/ui';

export function Archive() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ArchiveIcon className="h-7 w-7 text-slate-600" />
          Archive
        </h1>
        <p className="text-slate-500 mt-1">
          Close completed work with a commit message. Give your brain permission
          to stop revisiting finished projects.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Commit Form */}
        <CommitForm />

        {/* Why Archive */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Book className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">
              Why Commit to Archive?
            </h3>
          </div>

          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Think of archiving like making a{' '}
              <span className="font-mono bg-slate-100 px-1 rounded">
                git commit
              </span>{' '}
              for your brain. Without an explicit closure, your mind keeps the
              branch open, periodically checking if there's more work to do.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-700 mb-2">
                What happens when you archive:
              </p>
              <ul className="space-y-1 text-xs">
                <li>• Working memory releases the active weight</li>
                <li>• DMN (Default Mode Network) stops background processing</li>
                <li>• Clear signal that this branch is closed</li>
                <li>• Lesson learned gets stored for future reference</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-800 mb-1">Pro tip:</p>
              <p className="text-xs text-blue-700">
                Write your commit message as if explaining to your future self
                what happened and what you learned. Your brain will trust the
                archive and stop reopening the file.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="font-medium text-slate-700 flex items-center gap-2">
                <GitCommit className="h-4 w-4" />
                Good commit message examples:
              </p>
              <ul className="mt-2 space-y-2 text-xs font-mono bg-slate-900 text-green-400 p-3 rounded-lg">
                <li>"Completed Q4 planning. Key decisions: focus on mobile, defer API v2 to Q1."</li>
                <li>"Closed kitchen renovation. Lesson: get written quotes before starting."</li>
                <li>"Shipped feature X. Note: consider refactoring auth flow later."</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Archive;
