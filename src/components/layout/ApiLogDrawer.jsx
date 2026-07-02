import { useEffect, useState } from 'react';
import { subscribeToLog, getLogEntries, clearLog } from '../../api/apiLog';

const METHOD_COLORS = {
  GET: 'text-blue-600',
  POST: 'text-emerald-600',
  DELETE: 'text-red-600',
};

export default function ApiLogDrawer() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState(getLogEntries());

  useEffect(() => subscribeToLog(setEntries), []);

  return (
    <div className="fixed bottom-0 right-4 z-40 w-96">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-t-lg border border-b-0 border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200"
      >
        <span>API Activity {entries.length > 0 && `(${entries.length})`}</span>
        <span>{open ? '▾' : '▴'}</span>
      </button>
      {open && (
        <div className="max-h-72 overflow-y-auto scrollbar-thin border border-slate-700 bg-slate-900 text-xs">
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2">
            <span className="text-slate-400">Last {entries.length} request(s) this session</span>
            <button onClick={clearLog} className="text-slate-400 hover:text-white">
              Clear
            </button>
          </div>
          {entries.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-500">No requests yet.</div>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b border-slate-800 px-4 py-2 font-mono">
                <span className={METHOD_COLORS[e.method] || 'text-slate-300'}>{e.method}</span>
                <span className="mx-2 flex-1 truncate text-slate-300">{e.url}</span>
                <span className={e.ok ? 'text-emerald-400' : 'text-red-400'}>{e.status}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
