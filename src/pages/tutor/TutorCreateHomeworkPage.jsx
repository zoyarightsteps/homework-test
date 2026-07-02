import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHomeworkDraft } from '../../services/tutor.service';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { saveHomeworkCurriculum } from '../../utils/homeworkCurriculumCache';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Field';
import CurriculumPicker from '../../components/homework/CurriculumPicker';

export default function TutorCreateHomeworkPage() {
  const [selection, setSelection] = useState({ yearGroupId: '', subjectId: '', topicId: '', subTopicIds: [] });
  const [instructions, setInstructions] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        subjectId: selection.subjectId,
        topicId: selection.topicId,
        subTopicIds: selection.subTopicIds?.length ? selection.subTopicIds : undefined,
        instructions: instructions || undefined,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
      };
      const homework = await createHomeworkDraft(payload);
      saveHomeworkCurriculum(homework.id, {
        yearGroupId: selection.yearGroupId,
        subjectId: selection.subjectId,
        topicId: selection.topicId,
      });
      toast.success('Draft created — now add some questions.');
      navigate(`/tutor/homeworks/${homework.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-lg font-bold text-slate-900">New Homework Draft</h1>
      <p className="mb-5 text-sm text-slate-500">
        Step 1 of 3 — pick the curriculum area. You'll add questions and assign to a child next.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="space-y-4 p-5">
          <CurriculumPicker
            subjectId={selection.subjectId}
            topicId={selection.topicId}
            subTopicIds={selection.subTopicIds}
            multiSubTopic
            onChange={setSelection}
          />
        </Card>

        <Card className="space-y-4 p-5">
          <Textarea
            label="Instructions (optional)"
            placeholder="e.g. Show all working"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <Input
            label="Estimated Minutes"
            type="number"
            min="1"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
          />
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate('/tutor')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !selection.subjectId || !selection.topicId}>
            {saving ? 'Creating…' : 'Create Draft'}
          </Button>
        </div>
      </form>
    </div>
  );
}
