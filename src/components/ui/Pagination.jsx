import Button from './Button';

export default function Pagination({ page, hasNextPage, onChange, total }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
      <span className="text-xs text-slate-500">{total != null ? `${total} total` : ''}</span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <span className="text-xs text-slate-500">Page {page}</span>
        <Button variant="secondary" size="sm" disabled={!hasNextPage} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
