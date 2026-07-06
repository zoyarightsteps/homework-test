import { useEffect, useState } from 'react';
import { getBundleDetail } from '../../services/marketplace.service';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { useToast } from '../../context/ToastContext';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import StarRating from './StarRating';

function formatPence(p) {
  return p != null ? `£${(p / 100).toFixed(2)}` : '—';
}

export default function BundleDetailModal({ bundleType, entityId, childId, onClose, onAddToCart, onOpenBundle, onBrowseSubjectTopics }) {
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBundleDetail(bundleType, entityId, { childId })
      .then(setDetail)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [bundleType, entityId, childId]);

  return (
    <Modal
      open
      onClose={onClose}
      title={detail?.name || 'Bundle detail'}
      footer={
        detail && (
          <>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onAddToCart(detail.bundleType, detail.entityId)}>Add to Cart</Button>
          </>
        )
      }
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Spinner /> Loading…
        </div>
      ) : detail ? (
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-1 text-xs">
              {detail.bundleType !== 'SUBJECT' ? (
                <button
                  type="button"
                  onClick={() => onOpenBundle('SUBJECT', detail.subjectId)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {detail.subjectName}
                </button>
              ) : (
                <span className="font-medium text-slate-500">{detail.subjectName}</span>
              )}
              {detail.bundleType === 'SUBTOPIC' && detail.topicName && (
                <>
                  <span className="text-slate-300">/</span>
                  <button
                    type="button"
                    onClick={() => onOpenBundle('TOPIC', detail.topicId)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {detail.topicName}
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-100 text-slate-600">{detail.bundleType}</Badge>
              <span className="text-xs text-slate-400">{detail.yearGroupName}</span>
            </div>
            {detail.description && <p className="mt-2 text-sm text-slate-700">{detail.description}</p>}
            {detail.bundleType === 'SUBJECT' && (
              <button
                type="button"
                onClick={() => onBrowseSubjectTopics(detail.subjectId)}
                className="mt-2 text-xs font-medium text-blue-600 hover:underline"
              >
                Browse topics in this subject →
              </button>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
            <div>
              {detail.discountPct > 0 && (
                <span className="mr-1 text-xs text-slate-400 line-through">{formatPence(detail.pricePence)}</span>
              )}
              <span className="font-semibold text-blue-800">{formatPence(detail.finalPricePence)}</span>
              {detail.discountPct > 0 && <span className="ml-1 text-xs text-blue-600">({detail.discountPct}% off)</span>}
            </div>
            <div className="text-xs text-blue-600">{detail.questionCount} questions · {detail.buyerCount} bought</div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <StarRating value={Math.round(detail.averageRating || 0)} readOnly />
            <span className="font-medium text-slate-800">{detail.averageRating ?? '—'}</span>
            <span className="text-xs text-slate-400">({detail.totalReviews} reviews)</span>
          </div>

          {detail.subTopics?.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase text-slate-400">Included subtopics — click to view</div>
              <div className="flex flex-wrap gap-1.5">
                {detail.subTopics.map((s) => (
                  <button key={s.id} type="button" onClick={() => onOpenBundle('SUBTOPIC', s.id)}>
                    <Badge className="bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700">{s.name}</Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {detail.previewQuestions?.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase text-slate-400">Preview questions</div>
              <div className="space-y-2">
                {detail.previewQuestions.map((q) => (
                  <div key={q.id} className="rounded-lg border border-slate-100 p-2 text-sm">
                    <div className="mb-1 flex gap-1.5">
                      <Badge className="bg-slate-100 text-slate-600">{q.type}</Badge>
                      {q.difficulty && <Badge className="bg-slate-100 text-slate-600">{q.difficulty}</Badge>}
                    </div>
                    <p className="text-slate-800">{q.questionText}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail.recentReviews?.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase text-slate-400">Recent reviews</div>
              <div className="space-y-2">
                {detail.recentReviews.map((r) => (
                  <div key={r.id} className="rounded-lg border border-slate-100 p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <StarRating value={r.rating} readOnly size="text-xs" />
                      <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1 text-xs font-medium text-slate-600">
                      {r.reviewerName} · {r.childYearGroup}
                    </div>
                    {r.reviewText && <p className="mt-1 text-slate-700">{r.reviewText}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        <p className="text-sm text-red-600">Couldn't load bundle detail.</p>
      )}
    </Modal>
  );
}
