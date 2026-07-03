import { useCallback, useEffect, useState } from 'react';
import { getPurchases } from '../../services/marketplace.service';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import ReviewsPanel from '../../components/marketplace/ReviewsPanel';

function formatPence(p) {
  return p != null ? `£${(p / 100).toFixed(2)}` : '—';
}

function bundleFor(purchase) {
  if (purchase.subTopic) return { bundleType: 'SUBTOPIC', entityId: purchase.subTopic.id, label: purchase.subTopic.name };
  if (purchase.topic) return { bundleType: 'TOPIC', entityId: purchase.topic.id, label: purchase.topic.name };
  return { bundleType: 'SUBJECT', entityId: purchase.subject?.id, label: purchase.subject?.name };
}

export default function ParentPurchasesPage() {
  const toast = useToast();
  const [purchases, setPurchases] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getPurchases({ page, limit: 10 })
      .then((data) => {
        setPurchases(data.purchases || []);
        setPagination(data.pagination || {});
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold text-slate-900">My Purchases</h1>
      <p className="mb-5 text-sm text-slate-500">Completed question bank purchases, and reviews you've left.</p>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Spinner /> Loading…
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No purchases yet" subtitle="Buy question bank access from the Marketplace." />
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {purchases.map((p) => {
                const bundle = bundleFor(p);
                const isOpen = openId === p.id;
                return (
                  <div key={p.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">
                          {bundle.label} <span className="text-xs font-normal text-slate-400">({p.subject?.name})</span>
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {p.child?.firstName} {p.child?.lastName} · {p.yearGroup?.name} · {p.questionCount} questions
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">
                          Purchased {new Date(p.purchasedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-50 text-green-700">{formatPence(p.finalPricePence)}</Badge>
                        <button
                          className="text-xs font-medium text-blue-700 hover:underline"
                          onClick={() => setOpenId(isOpen ? null : p.id)}
                        >
                          {isOpen ? 'Hide reviews' : 'Reviews'}
                        </button>
                      </div>
                    </div>
                    {isOpen && bundle.entityId && (
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <ReviewsPanel bundleType={bundle.bundleType} entityId={bundle.entityId} canWrite />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Pagination page={pagination.page || page} hasNextPage={pagination.hasNextPage} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
