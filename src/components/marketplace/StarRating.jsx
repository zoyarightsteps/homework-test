export default function StarRating({ value, onChange, readOnly, size = 'text-base' }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`inline-flex items-center gap-0.5 ${size}`}>
      {stars.map((n) =>
        readOnly ? (
          <span key={n} className={n <= value ? 'text-amber-400' : 'text-slate-200'}>
            ★
          </span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            className={`cursor-pointer ${n <= value ? 'text-amber-400' : 'text-slate-200'}`}
          >
            ★
          </button>
        ),
      )}
    </div>
  );
}
