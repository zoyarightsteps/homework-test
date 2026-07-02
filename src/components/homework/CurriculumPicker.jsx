import { useEffect, useState } from 'react';
import { browseCurriculum } from '../../services/curriculum.service';
import { Select } from '../ui/Field';
import Spinner from '../ui/Spinner';

export default function CurriculumPicker({
  subjectId,
  topicId,
  subTopicId,
  subTopicIds,
  objectiveId,
  onChange,
  includeObjective = false,
  multiSubTopic = false,
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
        <Select
          label="Year Group"
          value={yearGroupId}
          onChange={(e) => {
            const value = e.target.value;
            setYearGroupId(value);
            onChange({ yearGroupId: value, subjectId: '', topicId: '', subTopicId: '', subTopicIds: [], objectiveId: '' });
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
          label="Subject"
          required
          value={subjectId || ''}
          disabled={!yearGroupId}
          onChange={(e) =>
            onChange({ yearGroupId, subjectId: e.target.value, topicId: '', subTopicId: '', subTopicIds: [], objectiveId: '' })
          }
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
          onChange={(e) =>
            onChange({ yearGroupId, subjectId, topicId: e.target.value, subTopicId: '', subTopicIds: [], objectiveId: '' })
          }
        >
          <option value="">Select topic…</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>

        {!multiSubTopic && (
          <Select
            label="Subtopic"
            required={includeObjective}
            value={subTopicId || ''}
            disabled={!topicId}
            onChange={(e) => onChange({ yearGroupId, subjectId, topicId, subTopicId: e.target.value, objectiveId: '' })}
          >
            <option value="">Select subtopic…</option>
            {subTopics.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {multiSubTopic && (
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-600">
            Subtopics <span className="font-normal text-slate-400">(optional — a homework can cover more than one)</span>
          </p>
          {!topicId && <p className="text-xs text-slate-400">Select a topic first.</p>}
          {topicId && subTopics.length === 0 && !loading && (
            <p className="text-xs text-slate-400">No subtopics under this topic.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {subTopics.map((s) => {
              const checked = (subTopicIds || []).includes(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                    checked ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-3 w-3"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...(subTopicIds || []), s.id]
                        : (subTopicIds || []).filter((id) => id !== s.id);
                      onChange({ yearGroupId, subjectId, topicId, subTopicIds: next });
                    }}
                  />
                  {s.name}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {includeObjective && !multiSubTopic && (
        <Select
          label="Learning Objective (optional)"
          value={objectiveId || ''}
          disabled={!subTopicId}
          onChange={(e) => onChange({ yearGroupId, subjectId, topicId, subTopicId, objectiveId: e.target.value })}
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
