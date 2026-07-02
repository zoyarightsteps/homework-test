import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getTutorHomeworkDetail,
  addQuestions,
  assignHomework,
  cancelHomework,
  deleteDraft,
  gradeHomework,
  revertHomework,
  browseBankQuestions,
  checkCanAssign,
} from '../../services/tutor.service';
import { QUESTION_TYPES, TUTOR_GRADES } from '../../constants/homework';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { browseCurriculum } from '../../services/curriculum.service';
import { getHomeworkCurriculum, saveHomeworkCurriculum } from '../../utils/homeworkCurriculumCache';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Field';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import QuestionTypeFields from '../../components/homework/QuestionTypeFields';
import { defaultsForType, validateQuestionFields } from '../../utils/questionTypeDefaults';

const emptyQuestion = {
  type: 'MULTIPLE_CHOICE',
  questionText: '',
  modelAnswer: '',
  options: ['', ''],
  correctOption: '',
  matchPairs: {},
  orderItems: ['', ''],
  blankAnswers: [''],
  subTopicId: '',
  objectiveId: '',
};

function toLocalInputValue(isoDeadline) {
  const d = new Date(Date.now() + 48 * 60 * 60 * 1000);
  return isoDeadline ? isoDeadline.slice(0, 16) : d.toISOString().slice(0, 16);
}

export default function TutorHomeworkDetailPage() {
  const { homeworkId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [hw, setHw] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newQuestion, setNewQuestion] = useState(emptyQuestion);
  const [addingQuestion, setAddingQuestion] = useState(false);

  const [bankSubTopicId, setBankSubTopicId] = useState('');
  const [bankObjectiveId, setBankObjectiveId] = useState('');
  const [bankResults, setBankResults] = useState([]);
  const [bankSearching, setBankSearching] = useState(false);

  const [yearGroups, setYearGroups] = useState([]);
  const [currYearGroupId, setCurrYearGroupId] = useState('');
  const [topicsForSubject, setTopicsForSubject] = useState([]);
  const [currTopicId, setCurrTopicId] = useState('');

  const [childId, setChildId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const [tutorGrade, setTutorGrade] = useState('');
  const [tutorFeedback, setTutorFeedback] = useState('');
  const [questionGrades, setQuestionGrades] = useState({});
  const [grading, setGrading] = useState(false);

  const [revertSelection, setRevertSelection] = useState({});
  const [reverting, setReverting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getTutorHomeworkDetail(homeworkId)
      .then((data) => {
        setHw(data);
        setBankSubTopicId(data.subTopics?.[0]?.id || '');
        setDeadline(toLocalInputValue(data.deadline));
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeworkId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    browseCurriculum().then((data) => setYearGroups(data.yearGroups || []));
  }, []);

  useEffect(() => {
    if (!hw) return;
    const cached = getHomeworkCurriculum(homeworkId);
    if (cached?.yearGroupId) setCurrYearGroupId(cached.yearGroupId);
    if (cached?.topicId) setCurrTopicId(cached.topicId);
  }, [hw, homeworkId]);

  useEffect(() => {
    if (!currYearGroupId || !hw?.subject?.id) {
      setTopicsForSubject([]);
      return;
    }
    browseCurriculum({ yearGroupId: currYearGroupId, subjectId: hw.subject.id }).then((data) =>
      setTopicsForSubject(data.topics || [])
    );
  }, [currYearGroupId, hw?.subject?.id]);

  useEffect(() => {
    if (currYearGroupId && currTopicId && hw?.subject?.id) {
      saveHomeworkCurriculum(homeworkId, { yearGroupId: currYearGroupId, subjectId: hw.subject.id, topicId: currTopicId });
    }
  }, [currYearGroupId, currTopicId, homeworkId, hw?.subject?.id]);

  if (loading || !hw) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-slate-400">
        <Spinner /> Loading homework…
      </div>
    );
  }

  const selectedTopicForCurriculum = topicsForSubject.find((t) => t.id === currTopicId);
  const subTopicsForTopic = selectedTopicForCurriculum?.subTopics || [];

  const taggedSubTopicIds = new Set((hw.subTopics || []).map((s) => s.id));
  const isRestrictedToTaggedSubTopics = taggedSubTopicIds.size > 0;
  const questionLevelSubTopics = isRestrictedToTaggedSubTopics
    ? subTopicsForTopic.length
      ? subTopicsForTopic.filter((s) => taggedSubTopicIds.has(s.id))
      : hw.subTopics || []
    : subTopicsForTopic;
  const subTopicPickerDisabled = !isRestrictedToTaggedSubTopics && !currTopicId;

  const selectedBankSubTopic = subTopicsForTopic.find((s) => s.id === bankSubTopicId);
  const selectedQuestionSubTopic = subTopicsForTopic.find((s) => s.id === newQuestion.subTopicId);

  const handleAddCustomQuestion = async (e) => {
    e.preventDefault();
    const validationError = validateQuestionFields(newQuestion.type, newQuestion);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setAddingQuestion(true);
    try {
      const payload = {
        type: newQuestion.type,
        questionText: newQuestion.questionText,
        order: (hw.questions?.length || 0) + 1,
        subTopicId: newQuestion.subTopicId || undefined,
        objectiveId: newQuestion.objectiveId || undefined,
      };
      if (newQuestion.type === 'MULTIPLE_CHOICE' || newQuestion.type === 'TRUE_FALSE') {
        payload.options = newQuestion.options.filter(Boolean);
        payload.correctOption = newQuestion.correctOption;
      } else if (newQuestion.type === 'MATCH') {
        payload.matchPairs = newQuestion.matchPairs;
      } else if (newQuestion.type === 'ORDERING') {
        payload.orderItems = newQuestion.orderItems.filter(Boolean);
      } else if (newQuestion.type === 'FILL_BLANK') {
        payload.blankAnswers = newQuestion.blankAnswers.filter(Boolean);
      } else {
        payload.modelAnswer = newQuestion.modelAnswer || undefined;
      }
      await addQuestions(homeworkId, [payload]);
      toast.success('Question added');
      setNewQuestion(emptyQuestion);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingQuestion(false);
    }
  };

  const searchBank = async () => {
    if (!bankSubTopicId) {
      toast.error('Select a subtopic to search the bank');
      return;
    }
    setBankSearching(true);
    try {
      const data = await browseBankQuestions({
        subTopicId: bankSubTopicId,
        objectiveId: bankObjectiveId || undefined,
        limit: 10,
      });
      setBankResults(data.questions || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBankSearching(false);
    }
  };

  const addBankQuestion = async (bankQuestionId) => {
    try {
      await addQuestions(homeworkId, [{ bankQuestionId, order: (hw.questions?.length || 0) + 1 }]);
      toast.success('Bank question added');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCheckEligibility = async () => {
    if (!sessionId) return;
    setCheckingEligibility(true);
    try {
      const data = await checkCanAssign(sessionId);
      setEligibility(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssigning(true);
    try {
      const payload = {
        childId,
        sessionId: sessionId || undefined,
        deadline: new Date(deadline).toISOString(),
      };
      const assigned = await assignHomework(homeworkId, payload);
      toast.success('Homework assigned to child');
      navigate(`/tutor/homeworks/${assigned.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!window.confirm('Delete this draft permanently?')) return;
    try {
      await deleteDraft(homeworkId);
      toast.success('Draft deleted');
      navigate('/tutor');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this homework?')) return;
    try {
      await cancelHomework(homeworkId);
      toast.success('Homework cancelled');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    setGrading(true);
    try {
      const payload = {
        tutorGrade,
        tutorFeedback: tutorFeedback || undefined,
        questionGrades: Object.entries(questionGrades)
          .filter(([, v]) => v.tutorGrade)
          .map(([questionId, v]) => ({ questionId, tutorGrade: v.tutorGrade, tutorFeedback: v.tutorFeedback || undefined })),
      };
      await gradeHomework(homeworkId, payload);
      toast.success('Homework graded');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGrading(false);
    }
  };

  const handleRevert = async (e) => {
    e.preventDefault();
    const questions = Object.entries(revertSelection)
      .filter(([, v]) => v.checked && v.revertNote)
      .map(([questionId, v]) => ({ questionId, revertNote: v.revertNote }));
    if (questions.length === 0) {
      toast.error('Select at least one question and add a note');
      return;
    }
    setReverting(true);
    try {
      await revertHomework(homeworkId, questions);
      toast.success('Questions reverted for the child to redo');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReverting(false);
    }
  };

  const isDraft = hw.status === 'DRAFT';
  const isSubmitted = hw.status === 'SUBMITTED';
  const isCancellable = hw.status === 'ASSIGNED' || hw.status === 'IN_PROGRESS';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{hw.subject?.name || 'Homework'}</h1>
            <p className="text-sm text-slate-500">
              {hw.subTopics?.map((s) => s.name).join(', ') || 'No subtopics'} · {hw.child?.name || 'Not assigned'}
            </p>
          </div>
          <StatusBadge status={hw.status} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4">
          <div>Deadline: {hw.deadline ? new Date(hw.deadline).toLocaleString() : '—'}</div>
          <div>Est. minutes: {hw.estimatedMinutes ?? '—'}</div>
          <div>Score: {hw.score != null ? `${hw.score}/${hw.scoreOutOf}` : '—'}</div>
          <div>Tutor grade: {hw.tutorGrade || '—'}</div>
        </div>
        {hw.instructions && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{hw.instructions}</p>}

        <div className="mt-4 flex gap-2">
          {isDraft && (
            <Button variant="danger" size="sm" onClick={handleDeleteDraft}>
              Delete Draft
            </Button>
          )}
          {isCancellable && (
            <Button variant="danger" size="sm" onClick={handleCancel}>
              Cancel Homework
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Questions ({hw.questions?.length || 0})</h2>
        {hw.questions?.length === 0 ? (
          <p className="text-sm text-slate-400">No questions added yet.</p>
        ) : (
          <div className="space-y-3">
            {hw.questions.map((q) => (
              <div key={q.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Q{q.order} · {q.type}
                  </span>
                  <div className="flex gap-1">
                    {q.isReverted && <Badge className="bg-orange-100 text-orange-700">Reverted</Badge>}
                    {q.answers?.[0]?.tutorGrade && <Badge className="bg-emerald-100 text-emerald-700">{q.answers[0].tutorGrade}</Badge>}
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-800">{q.questionText}</p>
                {q.answers?.[0] && (isSubmitted || hw.status === 'COMPLETED' || hw.status === 'REVERTED') && (
                  <div className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                    <span className="font-semibold">Answer: </span>
                    {q.answers[0].textAnswer ||
                      q.answers[0].selectedOption ||
                      (q.answers[0].orderAnswer?.length ? q.answers[0].orderAnswer.join(' → ') : null) ||
                      (q.answers[0].matchAnswer ? JSON.stringify(q.answers[0].matchAnswer) : null) ||
                      (q.answers[0].isSkipped ? 'Skipped' : '—')}
                    {q.answers[0].aiGrade && <div>AI grade: {q.answers[0].aiGrade}</div>}
                  </div>
                )}
                {isSubmitted && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Select
                      label="Grade this question"
                      value={questionGrades[q.id]?.tutorGrade || ''}
                      onChange={(e) =>
                        setQuestionGrades((prev) => ({ ...prev, [q.id]: { ...prev[q.id], tutorGrade: e.target.value } }))
                      }
                    >
                      <option value="">Skip</option>
                      {TUTOR_GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </Select>
                    <Input
                      label="Feedback"
                      value={questionGrades[q.id]?.tutorFeedback || ''}
                      onChange={(e) =>
                        setQuestionGrades((prev) => ({ ...prev, [q.id]: { ...prev[q.id], tutorFeedback: e.target.value } }))
                      }
                    />
                  </div>
                )}
                {isSubmitted && (
                  <label className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      checked={revertSelection[q.id]?.checked || false}
                      onChange={(e) =>
                        setRevertSelection((prev) => ({ ...prev, [q.id]: { ...prev[q.id], checked: e.target.checked } }))
                      }
                    />
                    Revert this question for redo
                    {revertSelection[q.id]?.checked && (
                      <input
                        className="ml-2 flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                        placeholder="Revert note"
                        value={revertSelection[q.id]?.revertNote || ''}
                        onChange={(e) =>
                          setRevertSelection((prev) => ({ ...prev, [q.id]: { ...prev[q.id], revertNote: e.target.value } }))
                        }
                      />
                    )}
                  </label>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {isDraft && (
        <>
          <Card className="p-5">
            <h2 className="mb-1 text-sm font-semibold text-slate-800">Curriculum context</h2>
            <p className="mb-3 text-xs text-slate-400">
              Pick the year group so we can look up subtopics/objectives under <strong>{hw.subject?.name}</strong> →{' '}
              this homework's topic. Used below to tag questions and to browse the bank.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Year Group"
                value={currYearGroupId}
                onChange={(e) => {
                  setCurrYearGroupId(e.target.value);
                  setCurrTopicId('');
                }}
              >
                <option value="">Select year group…</option>
                {yearGroups.map((yg) => (
                  <option key={yg.id} value={yg.id}>
                    {yg.name} ({yg.keyStage})
                  </option>
                ))}
              </Select>
              <Select
                label="Topic"
                value={currTopicId}
                disabled={!currYearGroupId}
                onChange={(e) => setCurrTopicId(e.target.value)}
              >
                <option value="">Select topic…</option>
                {topicsForSubject.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Add a custom question</h2>
            <form onSubmit={handleAddCustomQuestion} className="space-y-3">
              <Select
                label="Type"
                value={newQuestion.type}
                onChange={(e) => setNewQuestion((prev) => ({ ...prev, type: e.target.value, ...defaultsForType(e.target.value) }))}
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
              <Textarea
                label="Question Text"
                required
                placeholder={newQuestion.type === 'FILL_BLANK' ? 'e.g. The capital of France is ___ and it is in ___.' : undefined}
                value={newQuestion.questionText}
                onChange={(e) => setNewQuestion((prev) => ({ ...prev, questionText: e.target.value }))}
              />
              {newQuestion.type === 'FILL_BLANK' && (
                <p className="-mt-2 text-xs text-slate-400">
                  Mark each blank with <code className="rounded bg-slate-100 px-1">___</code> in the text above, then add
                  the correct answer for each blank below, in the same left-to-right order.
                </p>
              )}
              <QuestionTypeFields
                type={newQuestion.type}
                value={newQuestion}
                onChange={(patch) => setNewQuestion((prev) => ({ ...prev, ...patch }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Subtopic (optional)"
                  value={newQuestion.subTopicId}
                  disabled={subTopicPickerDisabled}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, subTopicId: e.target.value, objectiveId: '' }))}
                >
                  <option value="">None</option>
                  {questionLevelSubTopics.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Objective (optional)"
                  value={newQuestion.objectiveId}
                  disabled={!newQuestion.subTopicId || !selectedQuestionSubTopic}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, objectiveId: e.target.value }))}
                >
                  <option value="">None</option>
                  {(selectedQuestionSubTopic?.objectives || []).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.objectiveId} — {o.learningObjective}
                    </option>
                  ))}
                </Select>
              </div>
              {subTopicPickerDisabled && (
                <p className="-mt-2 text-xs text-slate-400">
                  Set year group + topic above to tag this question with a subtopic/objective.
                </p>
              )}
              {!subTopicPickerDisabled && newQuestion.subTopicId && !currTopicId && (
                <p className="-mt-2 text-xs text-slate-400">
                  Set year group + topic above to also pick an objective for this subtopic.
                </p>
              )}
              <Button type="submit" disabled={addingQuestion}>
                {addingQuestion ? 'Adding…' : '+ Add Question'}
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Add from question bank</h2>
            {isRestrictedToTaggedSubTopics ? (
              <p className="mb-2 text-xs text-slate-400">
                This draft is tagged to specific subtopics — only searching within those.
              </p>
            ) : (
              !currTopicId && (
                <p className="mb-2 text-xs text-slate-400">
                  Set year group + topic above to see this topic's subtopics.
                </p>
              )
            )}
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Subtopic"
                value={bankSubTopicId}
                disabled={subTopicPickerDisabled}
                onChange={(e) => {
                  setBankSubTopicId(e.target.value);
                  setBankObjectiveId('');
                }}
              >
                <option value="">Select subtopic…</option>
                {questionLevelSubTopics.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Objective (optional)"
                value={bankObjectiveId}
                disabled={!selectedBankSubTopic}
                onChange={(e) => setBankObjectiveId(e.target.value)}
              >
                <option value="">Any</option>
                {(selectedBankSubTopic?.objectives || []).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.objectiveId} — {o.learningObjective}
                  </option>
                ))}
              </Select>
            </div>
            {isRestrictedToTaggedSubTopics && !currTopicId && (
              <p className="mt-2 text-xs text-slate-400">
                Set year group + topic above to also filter by objective.
              </p>
            )}
            <div className="mt-3 flex justify-end">
              <Button type="button" variant="secondary" onClick={searchBank} disabled={bankSearching}>
                {bankSearching ? 'Searching…' : 'Search'}
              </Button>
            </div>
            {bankResults.length > 0 && (
              <div className="mt-3 space-y-2">
                {bankResults.map((q) => (
                  <div key={q.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
                    <span className="text-sm text-slate-700">{q.questionText}</span>
                    <Button size="sm" onClick={() => addBankQuestion(q.id)}>
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Assign to child</h2>
            <form onSubmit={handleAssign} className="space-y-3">
              <Input
                label="Child ID"
                required
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                placeholder="cuid of the child"
              />
              <div className="flex items-end gap-2">
                <Input
                  label="Session ID (optional)"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={handleCheckEligibility} disabled={!sessionId || checkingEligibility}>
                  {checkingEligibility ? 'Checking…' : 'Check eligibility'}
                </Button>
              </div>
              {eligibility && (
                <p className={`text-xs ${eligibility.canAssign ? 'text-emerald-600' : 'text-red-600'}`}>
                  {eligibility.canAssign ? 'Eligible to assign.' : eligibility.reason || 'Not eligible.'}
                </p>
              )}
              <Input label="Deadline" type="datetime-local" required value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              <Button type="submit" disabled={assigning || !hw.questions?.length}>
                {assigning ? 'Assigning…' : 'Assign Homework'}
              </Button>
              {!hw.questions?.length && <p className="text-xs text-slate-400">Add at least one question first.</p>}
            </form>
          </Card>
        </>
      )}

      {isSubmitted && (
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Grade homework</h2>
          <form onSubmit={handleGrade} className="space-y-3">
            <Select label="Overall Grade" required value={tutorGrade} onChange={(e) => setTutorGrade(e.target.value)}>
              <option value="">Select grade…</option>
              {TUTOR_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
            <Textarea label="Overall Feedback" value={tutorFeedback} onChange={(e) => setTutorFeedback(e.target.value)} />
            <Button type="submit" disabled={grading || !tutorGrade}>
              {grading ? 'Submitting…' : 'Submit Grade'}
            </Button>
          </form>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">Or revert specific questions</h3>
            <p className="mb-2 text-xs text-slate-400">Check questions above, add a note, then revert.</p>
            <Button type="button" variant="secondary" onClick={handleRevert} disabled={reverting}>
              {reverting ? 'Reverting…' : 'Revert Selected Questions'}
            </Button>
          </div>
        </Card>
      )}

      {hw.status === 'COMPLETED' && (
        <Card className="p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Final result</h2>
          <p className="text-sm text-slate-600">
            Grade: <strong>{hw.tutorGrade}</strong> · Score: {hw.score}/{hw.scoreOutOf}
          </p>
          {hw.tutorFeedback && <p className="mt-2 text-sm text-slate-500">{hw.tutorFeedback}</p>}
        </Card>
      )}
    </div>
  );
}
