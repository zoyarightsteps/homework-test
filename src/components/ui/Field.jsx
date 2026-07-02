const baseInputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500';

function Label({ children, required }) {
  if (!children) return null;
  return (
    <label className="mb-1 block text-xs font-semibold text-slate-600">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

export function Input({ label, required, className = '', ...props }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input className={`${baseInputClass} ${className}`} {...props} />
    </div>
  );
}

export function Textarea({ label, required, className = '', ...props }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <textarea className={`${baseInputClass} ${className}`} rows={3} {...props} />
    </div>
  );
}

export function Select({ label, required, className = '', children, ...props }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <select className={`${baseInputClass} ${className}`} {...props}>
        {children}
      </select>
    </div>
  );
}

export { Label };
