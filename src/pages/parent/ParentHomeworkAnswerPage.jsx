import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getChildHomeworkDetail,
  saveDraftAnswers,
  submitHomework,
  resubmitHomework,
} from '../../services/parent.service';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import QuestionAnswerInput from '../../components/homework/QuestionAnswerInput';

function buildAnswerFromExisting(existing) {
  if (!existing) return {};
  return {
    textAnswer: existing.textAnswer || '',
    selectedOption: existing.selectedOption || '',
    matchAnswer: existing.matchAnswer || {},
    orderAnswer: existing.orderAnswer || [],
    isSkipped: existing.isSkipped || false,
  };
}

export default function ParentHomeworkAnswerPage() {
  const { childId, homeworkId } = useParams();
  const toast = useToast();

  const [hw, setHw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getChildHomeworkDetail(childId, homeworkId)
      .then((data) => {
        setHw(data);
        const initial = {};
        (data.questions || []).forEach((q) => {
          initial[q.id] = buildAnswerFromExisting(q.answers?.[0]);
        });
        setAnswers(initial);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, homeworkId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !hw) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-slate-400">
        <Spinner /> Loading homework…
      </div>
    );
  }

  const isEditable = hw.status === 'ASSIGNED' || hw.status === 'IN_PROGRESS';
  const isReverted = hw.status === 'REVERTED';
  const isReadOnly = !isEditable && !isReverted;

  const buildAnswersPayload = (questions) =>
    questions.map((q) => {
      const a = answers[q.id] || {};
      return {
        questionId: q.id,
        textAnswer: a.textAnswer || undefined,
        selectedOption: a.selectedOption || undefined,
        matchAnswer: a.matchAnswer && Object.keys(a.matchAnswer).length ? a.matchAnswer : undefined,
        orderAnswer: a.orderAnswer?.length ? a.orderAnswer : undefined,
        isSkipped: false,
      };
    });

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await saveDraftAnswers(childId, homeworkId, buildAnswersPayload(hw.questions));
      toast.success('Draft saved');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Submit this homework? You will not be able to edit answers after submitting.')) return;
    setSubmitting(true);
    try {
      await saveDraftAnswers(childId, homeworkId, buildAnswersPayload(hw.questions));
      await submitHomework(childId, homeworkId);
      toast.success('Homework submitted!');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    const revertedQuestions = hw.questions.filter((q) => q.isReverted);
    if (!window.confirm('Resubmit reverted questions?')) return;
    setSubmitting(true);
    try {
      await resubmitHomework(childId, homeworkId, buildAnswersPayload(revertedQuestions));
      toast.success('Resubmitted for grading');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const visibleQuestions = isReverted ? hw.questions.filter((q) => q.isReverted) : hw.questions;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{hw.subject?.name}</h1>
            <p className="text-sm text-slate-500">{hw.topic?.name}</p>
          </div>
          <StatusBadge status={hw.status} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-3">
          <div>Deadline: {hw.deadline ? new Date(hw.deadline).toLocaleString() : '—'}</div>
          <div>Est. minutes: {hw.estimatedMinutes ?? '—'}</div>
          <div>Score: {hw.score != null ? `${hw.score}/${hw.scoreOutOf}` : '—'}</div>
        </div>
        {hw.instructions && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{hw.instructions}</p>}
        {isReverted && (
          <p className="mt-3 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
            The tutor sent some questions back for another try — see below.
          </p>
        )}
        {hw.tutorFeedback && (
          <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Tutor feedback: {hw.tutorFeedback}</p>
        )}
      </Card>

      {visibleQuestions.map((q) => (
        <Card key={q.id} className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              Q{q.order} · {q.type}
            </span>
            {q.isReverted && <Badge className="bg-orange-100 text-orange-700">Redo requested</Badge>}
          </div>
          {q.passage && <p className="mb-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{q.passage}</p>}
          <p className="mb-3 text-sm font-medium text-slate-800">{q.questionText}</p>
          {q.isReverted && q.revertNote && (
            <p className="mb-3 text-xs text-orange-600">Tutor's note: {q.revertNote}</p>
          )}

          {isReadOnly ? (
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              {answers[q.id]?.textAnswer ||
                answers[q.id]?.selectedOption ||
                (answers[q.id]?.orderAnswer?.length ? answers[q.id].orderAnswer.join(' → ') : null) ||
                (answers[q.id]?.matchAnswer && Object.keys(answers[q.id].matchAnswer).length
                  ? JSON.stringify(answers[q.id].matchAnswer)
                  : null) ||
                'No answer submitted'}
              {q.answers?.[0]?.aiGrade && <div className="mt-1 text-xs text-slate-400">AI grade: {q.answers[0].aiGrade}</div>}
              {q.answers?.[0]?.tutorGrade && <div className="text-xs text-slate-400">Tutor grade: {q.answers[0].tutorGrade}</div>}
              {q.answers?.[0]?.tutorFeedback && <div className="text-xs text-slate-400">Feedback: {q.answers[0].tutorFeedback}</div>}
            </div>
          ) : (
            <QuestionAnswerInput
              question={q}
              value={answers[q.id]}
              onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
            />
          )}
        </Card>
      ))}

      {isEditable && (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleSaveDraft} disabled={saving}>
            {saving ? 'Saving…' : 'Save Draft'}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Homework'}
          </Button>
        </div>
      )}

      {isReverted && (
        <div className="flex justify-end">
          <Button onClick={handleResubmit} disabled={submitting}>
            {submitting ? 'Resubmitting…' : 'Resubmit'}
          </Button>
        </div>
      )}
    </div>
  );
}
