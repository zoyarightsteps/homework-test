import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createBankQuestion, updateBankQuestion } from '../../services/admin.service';
import { QUESTION_TYPES, EXAM_BOARDS, LEVELS, DIFFICULTIES } from '../../constants/homework';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import CurriculumPicker from '../../components/homework/CurriculumPicker';
import QuestionTypeFields from '../../components/homework/QuestionTypeFields';

const emptyForm = {
  subjectId: '',
  topicId: '',
  subTopicId: '',
  objectiveId: '',
  type: 'MULTIPLE_CHOICE',
  questionText: '',
  modelAnswer: '',
  options: ['', ''],
  correctOption: '',
  matchPairs: {},
  orderItems: ['', ''],
  blankAnswers: [''],
  examBoard: '',
  level: '',
  difficulty: '',
  price: 0,
};

export default function AdminQuestionFormPage() {
  const { bankQuestionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(bankQuestionId);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    const existing = location.state?.question;
    if (!existing) {
      toast.error('Open edit from the question list so we have the question data.');
      navigate('/admin', { replace: true });
      return;
    }
    setForm({
      ...emptyForm,
      ...existing,
      options: existing.options?.length ? existing.options : ['', ''],
      orderItems: existing.orderItems?.length ? existing.orderItems : ['', ''],
      blankAnswers: existing.blankAnswers?.length ? existing.blankAnswers : [''],
      matchPairs: existing.matchPairs || {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  const patch = (fields) => setForm((prev) => ({ ...prev, ...fields }));

  const buildPayload = () => {
    const payload = {
      subjectId: form.subjectId,
      topicId: form.topicId,
      subTopicId: form.subTopicId,
      objectiveId: form.objectiveId || undefined,
      type: form.type,
      questionText: form.questionText,
      examBoard: form.examBoard || undefined,
      level: form.level || undefined,
      difficulty: form.difficulty || undefined,
      price: Number(form.price) || 0,
    };
    if (form.type === 'MULTIPLE_CHOICE' || form.type === 'TRUE_FALSE') {
      payload.options = form.options.filter(Boolean);
      payload.correctOption = form.correctOption;
    } else if (form.type === 'MATCH') {
      payload.matchPairs = form.matchPairs;
    } else if (form.type === 'ORDERING') {
      payload.orderItems = form.orderItems.filter(Boolean);
    } else if (form.type === 'FILL_BLANK') {
      payload.blankAnswers = form.blankAnswers.filter(Boolean);
    } else {
      payload.modelAnswer = form.modelAnswer || undefined;
    }
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await updateBankQuestion(bankQuestionId, payload);
        toast.success('Question updated');
      } else {
        await createBankQuestion(payload);
        toast.success('Question created as draft — publish it to make it visible to tutors.');
      }
      navigate('/admin');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-lg font-bold text-slate-900">{isEdit ? 'Edit Question' : 'New Bank Question'}</h1>
      <p className="mb-5 text-sm text-slate-500">
        {isEdit ? 'Update this bank question.' : 'New questions start unpublished — publish from the list once ready.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-semibold text-slate-800">Curriculum</h2>
          <CurriculumPicker
            subjectId={form.subjectId}
            topicId={form.topicId}
            subTopicId={form.subTopicId}
            objectiveId={form.objectiveId}
            includeObjective
            onChange={patch}
          />
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-semibold text-slate-800">Question</h2>
          <Select label="Question Type" required value={form.type} onChange={(e) => patch({ type: e.target.value })}>
            {QUESTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Textarea
            label="Question Text"
            required
            placeholder={form.type === 'FILL_BLANK' ? 'e.g. The capital of France is ___ and it is in ___.' : undefined}
            value={form.questionText}
            onChange={(e) => patch({ questionText: e.target.value })}
          />
          {form.type === 'FILL_BLANK' && (
            <p className="-mt-2 text-xs text-slate-400">
              Mark each blank with <code className="rounded bg-slate-100 px-1">___</code> in the text above, then add the
              correct answer for each blank below, in the same left-to-right order.
            </p>
          )}
          <QuestionTypeFields type={form.type} value={form} onChange={patch} />
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-semibold text-slate-800">Metadata</h2>
          <div className="grid grid-cols-3 gap-3">
            <Select label="Exam Board" value={form.examBoard} onChange={(e) => patch({ examBoard: e.target.value })}>
              <option value="">None</option>
              {EXAM_BOARDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
            <Select label="Level" value={form.level} onChange={(e) => patch({ level: e.target.value })}>
              <option value="">None</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
            <Select label="Difficulty" value={form.difficulty} onChange={(e) => patch({ difficulty: e.target.value })}>
              <option value="">None</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Price (pence)"
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => patch({ price: e.target.value })}
          />
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Question'}
          </Button>
        </div>
      </form>
    </div>
  );
}
