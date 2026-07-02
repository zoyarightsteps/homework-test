import { Textarea } from '../ui/Field';
import Button from '../ui/Button';

export default function QuestionAnswerInput({ question, value, onChange, disabled }) {
  const answer = value || {};
  const patch = (fields) => onChange({ ...answer, ...fields });

  if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
    return (
      <div className="space-y-2">
        {(question.options || []).map((opt) => (
          <label key={opt} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
            <input
              type="radio"
              name={`q-${question.id}`}
              checked={answer.selectedOption === opt}
              disabled={disabled}
              onChange={() => patch({ selectedOption: opt })}
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }

  if (question.type === 'MATCH') {
    const pairs = Object.entries(question.matchPairs || {});
    const rightOptions = pairs.map(([, v]) => v);
    const matchAnswer = answer.matchAnswer || {};
    return (
      <div className="space-y-2">
        {pairs.map(([left]) => (
          <div key={left} className="flex items-center gap-2 text-sm">
            <span className="w-1/3 font-medium text-slate-700">{left}</span>
            <select
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={matchAnswer[left] || ''}
              disabled={disabled}
              onChange={(e) => patch({ matchAnswer: { ...matchAnswer, [left]: e.target.value } })}
            >
              <option value="">Match to…</option>
              {rightOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  if (question.type === 'ORDERING') {
    const items = answer.orderAnswer?.length ? answer.orderAnswer : question.orderItems || [];
    const move = (idx, dir) => {
      const next = [...items];
      const swapWith = idx + dir;
      if (swapWith < 0 || swapWith >= next.length) return;
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      patch({ orderAnswer: next });
    };
    return (
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div key={item} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <span>
              {idx + 1}. {item}
            </span>
            {!disabled && (
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => move(idx, -1)}>
                  ↑
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => move(idx, 1)}>
                  ↓
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (question.type === 'FILL_BLANK') {
    return (
      <Textarea
        label="Your answer (separate multiple blanks with a comma)"
        value={answer.textAnswer || ''}
        disabled={disabled}
        onChange={(e) => patch({ textAnswer: e.target.value })}
      />
    );
  }

  return (
    <Textarea
      label="Your answer"
      value={answer.textAnswer || ''}
      disabled={disabled}
      rows={question.type === 'LONG_ANSWER' || question.type === 'READING_COMPREHENSION' ? 5 : 2}
      onChange={(e) => patch({ textAnswer: e.target.value })}
    />
  );
}
