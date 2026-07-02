import { Textarea, Select } from '../ui/Field';
import Button from '../ui/Button';

function ListEditor({ label, items, onAdd, onRemove, onItemChange, placeholder, minItems = 0 }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={item}
              placeholder={placeholder}
              onChange={(e) => onItemChange(idx, e.target.value)}
            />
            <Button type="button" variant="secondary" size="sm" disabled={items.length <= minItems} onClick={() => onRemove(idx)}>
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={onAdd}>
          + Add item
        </Button>
        {minItems > 0 && <p className="text-xs text-slate-400">At least {minItems} required.</p>}
      </div>
    </div>
  );
}

export default function QuestionTypeFields({ type, value, onChange }) {
  const options = value.options || [];
  const matchPairs = value.matchPairs || {};
  const orderItems = value.orderItems || [];
  const blankAnswers = value.blankAnswers || [];
  const matchEntries = Object.entries(matchPairs);

  if (type === 'TRUE_FALSE') {
    return (
      <Select
        label="Correct Answer"
        required
        value={value.correctOption || ''}
        onChange={(e) => onChange({ options: ['True', 'False'], correctOption: e.target.value })}
      >
        <option value="">Select true or false…</option>
        <option value="True">True</option>
        <option value="False">False</option>
      </Select>
    );
  }

  if (type === 'MULTIPLE_CHOICE') {
    return (
      <div className="space-y-3">
        <ListEditor
          label="Options"
          items={options}
          placeholder="Option text"
          minItems={2}
          onAdd={() => onChange({ options: [...options, ''] })}
          onRemove={(idx) => onChange({ options: options.filter((_, i) => i !== idx) })}
          onItemChange={(idx, v) => onChange({ options: options.map((o, i) => (i === idx ? v : o)) })}
        />
        <Select
          label="Correct Option"
          required
          value={value.correctOption || ''}
          onChange={(e) => onChange({ correctOption: e.target.value })}
        >
          <option value="">Select correct option…</option>
          {options.filter(Boolean).map((o, idx) => (
            <option key={idx} value={o}>
              {o}
            </option>
          ))}
        </Select>
      </div>
    );
  }

  if (type === 'MATCH') {
    return (
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Match Pairs</label>
        <div className="space-y-2">
          {matchEntries.map(([k, v], idx) => (
            <div key={idx} className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Left"
                value={k}
                onChange={(e) => {
                  const entries = [...matchEntries];
                  entries[idx] = [e.target.value, v];
                  onChange({ matchPairs: Object.fromEntries(entries) });
                }}
              />
              <input
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Right"
                value={v}
                onChange={(e) => {
                  const entries = [...matchEntries];
                  entries[idx] = [k, e.target.value];
                  onChange({ matchPairs: Object.fromEntries(entries) });
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={matchEntries.length <= 2}
                onClick={() => onChange({ matchPairs: Object.fromEntries(matchEntries.filter((_, i) => i !== idx)) })}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({ matchPairs: { ...matchPairs, [`key${matchEntries.length + 1}`]: '' } })}
          >
            + Add pair
          </Button>
          <p className="text-xs text-slate-400">At least 2 pairs required.</p>
        </div>
      </div>
    );
  }

  if (type === 'ORDERING') {
    return (
      <ListEditor
        label="Order Items (in correct order)"
        items={orderItems}
        placeholder="Step text"
        minItems={2}
        onAdd={() => onChange({ orderItems: [...orderItems, ''] })}
        onRemove={(idx) => onChange({ orderItems: orderItems.filter((_, i) => i !== idx) })}
        onItemChange={(idx, v) => onChange({ orderItems: orderItems.map((o, i) => (i === idx ? v : o)) })}
      />
    );
  }

  if (type === 'FILL_BLANK') {
    return (
      <ListEditor
        label="Blank Answers (one per ___ in the text above, left to right)"
        items={blankAnswers}
        placeholder="Correct answer for this blank"
        minItems={1}
        onAdd={() => onChange({ blankAnswers: [...blankAnswers, ''] })}
        onRemove={(idx) => onChange({ blankAnswers: blankAnswers.filter((_, i) => i !== idx) })}
        onItemChange={(idx, v) => onChange({ blankAnswers: blankAnswers.map((o, i) => (i === idx ? v : o)) })}
      />
    );
  }

  return (
    <Textarea
      label="Model Answer"
      placeholder="Reference answer used for grading guidance"
      value={value.modelAnswer || ''}
      onChange={(e) => onChange({ modelAnswer: e.target.value })}
    />
  );
}
