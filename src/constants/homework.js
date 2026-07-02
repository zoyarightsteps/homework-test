export const QUESTION_TYPES = [
  'MULTIPLE_CHOICE',
  'SHORT_ANSWER',
  'LONG_ANSWER',
  'FILL_BLANK',
  'MATCH',
  'TRUE_FALSE',
  'ORDERING',
  'READING_COMPREHENSION',
  'VIDEO',
];

export const EXAM_BOARDS = ['EDEXCEL', 'AQA', 'OCR', 'WJEC', 'CAMBRIDGE', 'IB', 'NONE'];

export const LEVELS = ['KS3', 'GCSE', 'A_LEVEL', 'ELEVEN_PLUS', 'SATS'];

export const DIFFICULTIES = ['FOUNDATION', 'STANDARD', 'HIGHER', 'STRETCH'];

export const HOMEWORK_STATUSES = [
  'DRAFT',
  'ASSIGNED',
  'IN_PROGRESS',
  'SUBMITTED',
  'REVERTED',
  'COMPLETED',
  'MISSED',
  'CANCELLED',
];

export const TUTOR_GRADES = ['OUTSTANDING', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT'];

export const STATUS_COLORS = {
  DRAFT: 'bg-slate-100 text-slate-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  SUBMITTED: 'bg-indigo-100 text-indigo-700',
  REVERTED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  MISSED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-200 text-slate-500',
};
