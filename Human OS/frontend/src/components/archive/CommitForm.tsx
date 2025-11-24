import { useState } from 'react';
import { GitCommit } from 'lucide-react';
import { Card, CardHeader, Button, Input, Textarea } from '@/components/ui';
import { archiveAPI } from '@/services/api';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import type { ArchiveCommitRequest } from '@/types';

export function CommitForm() {
  const { addToast } = useCognitiveState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ArchiveCommitRequest>({
    object: '',
    summary: '',
    lesson: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.object.trim() || !formData.summary.trim()) {
      addToast('warning', 'Please fill in the object and summary');
      return;
    }

    try {
      setIsSubmitting(true);
      await archiveAPI.commit(formData);
      addToast('success', 'Archived successfully. Loop is now closed.');
      setFormData({ object: '', summary: '', lesson: '' });
    } catch {
      addToast('error', 'Failed to archive');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Commit to Archive"
        description="Close a completed project or task with a commit message"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Object"
          placeholder="What are you archiving? (e.g., 'Q4 planning project')"
          value={formData.object}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, object: e.target.value }))
          }
        />

        <Textarea
          label="Summary (Commit Message)"
          placeholder="What happened? What was accomplished?"
          value={formData.summary}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, summary: e.target.value }))
          }
          rows={4}
          helperText="Think of this as a git commit message for your brain"
        />

        <Textarea
          label="Lesson Learned (Optional)"
          placeholder="What did you learn? What would you do differently?"
          value={formData.lesson}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, lesson: e.target.value }))
          }
          rows={3}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isSubmitting}
          icon={<GitCommit className="h-5 w-5" />}
        >
          Commit & Archive
        </Button>
      </form>
    </Card>
  );
}

export default CommitForm;
