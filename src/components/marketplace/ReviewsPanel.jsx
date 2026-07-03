import { useEffect, useState } from 'react';
import { getReviews, submitReview, editReview, deleteReview } from '../../services/marketplace.service';
import { getMyReview, saveMyReview, clearMyReview } from '../../utils/myReviewCache';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import StarRating from './StarRating';
import Button from '../ui/Button';
import { Textarea } from '../ui/Field';
import Spinner from '../ui/Spinner';
import Pagination from '../ui/Pagination';

export default function ReviewsPanel({ bundleType, entityId, canWrite }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(1);

  const [myReview, setMyReview] = useState(() => (canWrite ? getMyReview(bundleType, entityId) : null));
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoadError('');
    getReviews({ bundleType, entityId, page, limit: 5 })
      .then(setData)
      .catch((err) => {
        setLoadError(getErrorMessage(err));
        toast.error(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundleType, entityId, page]);

  const startEditing = () => {
    setRating(myReview?.rating || 0);
    setReviewText(myReview?.reviewText || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!rating) {
      toast.error('Pick a star rating');
      return;
    }
    setSaving(true);
    try {
      const payload = { bundleType, entityId, rating, reviewText: reviewText || undefined };
      const result = myReview ? await editReview(payload) : await submitReview(payload);
      const saved = { rating, reviewText: reviewText || null, id: result.review?.id };
      saveMyReview(bundleType, entityId, saved);
      setMyReview(saved);
      setEditing(false);
      toast.success(myReview ? 'Review updated' : 'Review submitted');
      const refreshed = await getReviews({ bundleType, entityId, page, limit: 5 });
      setData(refreshed);
    } catch (err) {
      if (err.response?.status === 409) {
        const saved = { rating, reviewText: reviewText || null };
        saveMyReview(bundleType, entityId, saved);
        setMyReview(saved);
        toast.error('You already reviewed this bundle — showing edit form.');
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteReview({ bundleType, entityId });
      clearMyReview(bundleType, entityId);
      setMyReview(null);
      setEditing(false);
      toast.success('Review deleted');
      const refreshed = await getReviews({ bundleType, entityId, page, limit: 5 });
      setData(refreshed);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
        <Spinner /> Loading reviews…
      </div>
    );
  }

  if (loadError) {
    return <p className="text-sm text-red-600">Couldn't load reviews: {loadError}</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <StarRating value={Math.round(data?.averageRating || 0)} readOnly />
        <span className="font-medium text-slate-800">{data?.averageRating ?? '—'}</span>
        <span className="text-xs text-slate-400">({data?.totalReviews || 0} reviews)</span>
      </div>

      {canWrite && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          {editing ? (
            <div className="space-y-2">
              <StarRating value={rating} onChange={setRating} />
              <Textarea
                placeholder="Optional written review (max 500 chars)"
                maxLength={500}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" disabled={saving} onClick={handleSave}>
                  {myReview ? 'Save changes' : 'Submit review'}
                </Button>
                <Button size="sm" variant="secondary" disabled={saving} onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : myReview ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StarRating value={myReview.rating} readOnly size="text-sm" />
                <span className="text-xs font-semibold text-blue-700">Your review</span>
              </div>
              {myReview.reviewText && <p className="text-sm text-slate-700">{myReview.reviewText}</p>}
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={startEditing}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" disabled={saving} onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" onClick={startEditing}>
              Write a review
            </Button>
          )}
        </div>
      )}

      {data?.reviews?.length ? (
        <div className="space-y-2">
          {data.reviews.map((r) => (
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
          <Pagination page={data.pagination?.page || page} hasNextPage={data.pagination?.hasNextPage} total={data.pagination?.total} onChange={setPage} />
        </div>
      ) : (
        <p className="text-xs text-slate-400">No reviews yet for this bundle.</p>
      )}
    </div>
  );
}
