import { useEffect, useState } from 'react';
import { browseCurriculum } from '../../services/curriculum.service';
import { Select } from '../ui/Field';
import Spinner from '../ui/Spinner';

export default function CurriculumPicker({
  subjectId,
  topicId,
  subTopicId,
  objectiveId,
  onChange,
  includeObjective = false,
}) {
  const [yearGroupId, setYearGroupId] = useState('');
  const [yearGroups, setYearGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    browseCurriculum().then((data) => setYearGroups(data.yearGroups || []));
  }, []);

  useEffect(() => {
    if (!yearGroupId) {
      setSubjects([]);
      return;
    }
    setLoading(true);
    browseCurriculum({ yearGroupId })
      .then((data) => setSubjects(data.subjects || []))
      .finally(() => setLoading(false));
  }, [yearGroupId]);

  useEffect(() => {
    if (!yearGroupId || !subjectId) {
      setTopics([]);
      return;
    }
    setLoading(true);
    browseCurriculum({ yearGroupId, subjectId })
      .then((data) => setTopics(data.topics || []))
      .finally(() => setLoading(false));
  }, [yearGroupId, subjectId]);

  const selectedTopic = topics.find((t) => t.id === topicId);
  const subTopics = selectedTopic?.subTopics || [];
  const selectedSubTopic = subTopics.find((s) => s.id === subTopicId);
  const objectives = selectedSubTopic?.objectives || [];

  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Spinner className="h-3 w-3" /> Loading curriculum…
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Select label="Year Group" value={yearGroupId} onChange={(e) => setYearGroupId(e.target.value)}>
          <option value="">Select year group…</option>
          {yearGroups.map((yg) => (
            <option key={yg.id} value={yg.id}>
              {yg.name} ({yg.keyStage})
            </option>
          ))}
        </Select>

        <Select
          label="Subject"
          required
          value={subjectId || ''}
          disabled={!yearGroupId}
          onChange={(e) => onChange({ subjectId: e.target.value, topicId: '', subTopicId: '', objectiveId: '' })}
        >
          <option value="">Select subject…</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Topic"
          required
          value={topicId || ''}
          disabled={!subjectId}
          onChange={(e) => onChange({ subjectId, topicId: e.target.value, subTopicId: '', objectiveId: '' })}
        >
          <option value="">Select topic…</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>

        <Select
          label="Subtopic"
          required={includeObjective}
          value={subTopicId || ''}
          disabled={!topicId}
          onChange={(e) => onChange({ subjectId, topicId, subTopicId: e.target.value, objectiveId: '' })}
        >
          <option value="">Select subtopic…</option>
          {subTopics.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      {includeObjective && (
        <Select
          label="Learning Objective (optional)"
          value={objectiveId || ''}
          disabled={!subTopicId}
          onChange={(e) => onChange({ subjectId, topicId, subTopicId, objectiveId: e.target.value })}
        >
          <option value="">None</option>
          {objectives.map((o) => (
            <option key={o.id} value={o.id}>
              {o.objectiveId} — {o.learningObjective}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}
