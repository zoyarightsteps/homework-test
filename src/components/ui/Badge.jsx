export default function Badge({ className = '', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className || 'bg-slate-100 text-slate-700'}`}>
      {children}
    </span>
  );
}
