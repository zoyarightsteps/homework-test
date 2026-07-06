import StarRating from './StarRating';
import Badge from '../ui/Badge';

function formatPence(p) {
  return p != null ? `£${(p / 100).toFixed(2)}` : '—';
}

export default function BundleCard({ bundle, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col gap-2 rounded-xl border border-slate-100 p-4 text-left transition hover:border-blue-200 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <Badge className="bg-slate-100 text-slate-600">{bundle.bundleType}</Badge>
        {bundle.discountPct > 0 && <Badge className="bg-green-50 text-green-700">{bundle.discountPct}% off</Badge>}
      </div>
      <div className="font-semibold text-slate-900">{bundle.name}</div>
      <div className="text-xs text-slate-400">
        {bundle.subjectName} · {bundle.yearGroupName} · {bundle.questionCount} questions
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <StarRating value={Math.round(bundle.averageRating || 0)} readOnly size="text-xs" />
        <span className="text-slate-500">{bundle.averageRating ?? '—'}</span>
        <span className="text-slate-400">({bundle.totalReviews})</span>
      </div>
      <div className="mt-auto flex items-center justify-between pt-1">
        <div>
          {bundle.discountPct > 0 && (
            <span className="mr-1 text-xs text-slate-400 line-through">{formatPence(bundle.pricePence)}</span>
          )}
          <span className="font-semibold text-slate-900">{formatPence(bundle.finalPricePence)}</span>
        </div>
        <span className="text-xs text-slate-400">{bundle.buyerCount} bought</span>
      </div>
    </button>
  );
}
