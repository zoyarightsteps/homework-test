export default function StarRating({ value, onChange, readOnly, size = 'text-base' }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`inline-flex items-center gap-0.5 ${size}`}>
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} ${n <= value ? 'text-amber-400' : 'text-slate-200'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
