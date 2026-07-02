const listeners = new Set();
let entries = [];
let nextId = 1;

function emit() {
  listeners.forEach((fn) => fn(entries));
}

export function pushLogEntry(entry) {
  entries = [{ id: nextId++, ...entry }, ...entries].slice(0, 50);
  emit();
}

export function subscribeToLog(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getLogEntries() {
  return entries;
}

export function clearLog() {
  entries = [];
  emit();
}
