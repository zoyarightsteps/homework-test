export function defaultsForType(type) {
  if (type === 'MULTIPLE_CHOICE') return { options: ['', ''], correctOption: '' };
  if (type === 'TRUE_FALSE') return { options: ['True', 'False'], correctOption: '' };
  if (type === 'MATCH') return { matchPairs: { key1: '', key2: '' } };
  if (type === 'ORDERING') return { orderItems: ['', ''] };
  if (type === 'FILL_BLANK') return { blankAnswers: [''] };
  return { modelAnswer: '' };
}

export function validateQuestionFields(type, value) {
  if (type === 'MULTIPLE_CHOICE') {
    const nonEmpty = (value.options || []).filter(Boolean);
    if (nonEmpty.length < 2) return 'Multiple choice questions need at least 2 options.';
    if (!value.correctOption || !nonEmpty.includes(value.correctOption)) return 'Select a valid correct option.';
    return null;
  }
  if (type === 'TRUE_FALSE') {
    if (value.correctOption !== 'True' && value.correctOption !== 'False') return 'Select either True or False.';
    return null;
  }
  if (type === 'MATCH') {
    const entries = Object.entries(value.matchPairs || {}).filter(([k, v]) => k && v);
    if (entries.length < 2) return 'Match questions need at least 2 complete pairs.';
    return null;
  }
  if (type === 'ORDERING') {
    const nonEmpty = (value.orderItems || []).filter(Boolean);
    if (nonEmpty.length < 2) return 'Ordering questions need at least 2 items.';
    return null;
  }
  if (type === 'FILL_BLANK') {
    const nonEmpty = (value.blankAnswers || []).filter(Boolean);
    if (nonEmpty.length < 1) return 'Add at least one blank answer.';
    return null;
  }
  return null;
}
