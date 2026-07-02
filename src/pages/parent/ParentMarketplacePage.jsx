import { useEffect, useState } from 'react';
import { getMe } from '../../services/auth.service';
import {
  browseSubjects,
  browseTopics,
  browseSubtopics,
  getPrice,
  getPreview,
  getCart,
  addCartItem,
  removeCartItem,
  checkoutCart,
} from '../../services/marketplace.service';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Select } from '../../components/ui/Field';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

function formatPence(p) {
  return p != null ? `£${(p / 100).toFixed(2)}` : '—';
}

function BuyLevelRow({ label, price, disabled, onAdd, onPreview }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
      <div>
        <div className="font-medium">{label}</div>
        {price ? (
          <div className="text-xs">
            {formatPence(price.finalPrice)}
            {price.discountPercentage ? ` (${price.discountPercentage}% off)` : ''}
          </div>
        ) : (
          <div className="text-xs text-blue-400">Calculating price…</div>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={!price} onClick={onPreview}>
          Preview
        </Button>
        <Button size="sm" disabled={disabled || !price} onClick={onAdd}>
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

export default function ParentMarketplacePage() {
  const toast = useToast();

  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [topics, setTopics] = useState([]);
  const [topicId, setTopicId] = useState('');
  const [subtopics, setSubtopics] = useState([]);
  const [subTopicId, setSubTopicId] = useState('');

  const [subjectPrice, setSubjectPrice] = useState(null);
  const [topicPrice, setTopicPrice] = useState(null);
  const [subtopicPrice, setSubtopicPrice] = useState(null);

  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const selectedChild = children.find((c) => c.id === childId);
  const yearGroupId = selectedChild?.yearGroupId;

  useEffect(() => {
    getMe().then((data) => setChildren(data.parentProfile?.children || []));
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSubjectId('');
    setTopics([]);
    setSubtopics([]);
    if (!yearGroupId) {
      setSubjects([]);
      return;
    }
    browseSubjects({ yearGroupId }).then((data) => setSubjects(data.subjects || []));
  }, [yearGroupId]);

  useEffect(() => {
    setTopicId('');
    setSubtopics([]);
    if (!subjectId || !yearGroupId) {
      setTopics([]);
      return;
    }
    browseTopics({ subjectId, yearGroupId }).then((data) => setTopics(data.topics || []));
  }, [subjectId, yearGroupId]);

  useEffect(() => {
    setSubTopicId('');
    if (!topicId) {
      setSubtopics([]);
      return;
    }
    browseSubtopics({ topicId }).then((data) => setSubtopics(data.subTopics || []));
  }, [topicId]);

  // Each level is only ever selectable from a dropdown that already excludes
  // entities with no published questions, so no separate "has content" check is needed —
  // being selected here is proof it can be bought and previewed.
  useEffect(() => {
    setSubjectPrice(null);
    if (!subjectId || !yearGroupId) return;
    getPrice({ type: 'SUBJECT', entityId: subjectId, yearGroupId })
      .then(setSubjectPrice)
      .catch(() => setSubjectPrice(null));
  }, [subjectId, yearGroupId]);

  useEffect(() => {
    setTopicPrice(null);
    if (!topicId || !yearGroupId) return;
    getPrice({ type: 'TOPIC', entityId: topicId, yearGroupId })
      .then(setTopicPrice)
      .catch(() => setTopicPrice(null));
  }, [topicId, yearGroupId]);

  useEffect(() => {
    setSubtopicPrice(null);
    if (!subTopicId || !yearGroupId) return;
    getPrice({ type: 'SUBTOPIC', entityId: subTopicId, yearGroupId })
      .then(setSubtopicPrice)
      .catch(() => setSubtopicPrice(null));
  }, [subTopicId, yearGroupId]);

  function refreshCart() {
    setLoadingCart(true);
    getCart()
      .then(setCart)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoadingCart(false));
  }

  const handleAddToCart = async (type, entityId) => {
    try {
      await addCartItem({ type, entityId, childId });
      toast.success('Added to cart');
      setPreview(null);
      refreshCart();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await removeCartItem(cartItemId);
      refreshCart();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCheckout = async () => {
    try {
      const result = await checkoutCart({
        successUrl: `${window.location.origin}/parent/marketplace`,
        cancelUrl: `${window.location.origin}/parent/marketplace`,
      });
      if (result.url) {
        window.open(result.url, '_blank');
      } else {
        toast.success('Checkout session created');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openPreview = async (type, entityId, label, price) => {
    setPreviewLoading(true);
    setPreview({ type, entityId, label, price, data: null });
    try {
      const data = await getPreview({ type, entityId, yearGroupId });
      setPreview({ type, entityId, label, price, data });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold text-slate-900">Question Bank Marketplace</h1>
      <p className="mb-5 text-sm text-slate-500">Buy access to extra practice questions for a child.</p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="space-y-4 p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800">Browse</h2>
          <Select label="Child" required value={childId} onChange={(e) => setChildId(e.target.value)}>
            <option value="">Select a child…</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          {selectedChild && !yearGroupId && (
            <p className="text-xs text-amber-600">This child has no year group assigned yet.</p>
          )}

          <Select label="Subject" value={subjectId} disabled={!yearGroupId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">Select subject…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          {subjectId && (
            <BuyLevelRow
              label="Buy the whole subject"
              price={subjectPrice}
              disabled={!childId}
              onAdd={() => handleAddToCart('SUBJECT', subjectId)}
              onPreview={() => openPreview('SUBJECT', subjectId, 'Whole subject', subjectPrice)}
            />
          )}

          <Select label="Topic" value={topicId} disabled={!subjectId} onChange={(e) => setTopicId(e.target.value)}>
            <option value="">Select topic…</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          {subjectId && topics.length === 0 && (
            <p className="text-xs text-slate-400">No individual topics on their own — the whole-subject bundle above covers everything.</p>
          )}
          {topicId && (
            <BuyLevelRow
              label="Buy the whole topic"
              price={topicPrice}
              disabled={!childId}
              onAdd={() => handleAddToCart('TOPIC', topicId)}
              onPreview={() => openPreview('TOPIC', topicId, 'Whole topic', topicPrice)}
            />
          )}

          <Select label="Subtopic" value={subTopicId} disabled={!topicId} onChange={(e) => setSubTopicId(e.target.value)}>
            <option value="">Select subtopic…</option>
            {subtopics.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          {topicId && subtopics.length === 0 && (
            <p className="text-xs text-slate-400">No individual subtopics on their own — the whole-topic bundle above covers everything.</p>
          )}
          {subTopicId && (
            <BuyLevelRow
              label="Buy just this subtopic"
              price={subtopicPrice}
              disabled={!childId}
              onAdd={() => handleAddToCart('SUBTOPIC', subTopicId)}
              onPreview={() => openPreview('SUBTOPIC', subTopicId, 'This subtopic', subtopicPrice)}
            />
          )}

          {subjects.length === 0 && yearGroupId && (
            <EmptyState title="No published questions yet for this year group" subtitle="Ask an admin to publish some bank questions." />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Cart</h2>
          {loadingCart ? (
            <Spinner />
          ) : !cart?.items?.length ? (
            <EmptyState title="Cart is empty" />
          ) : (
            <div className="space-y-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2 text-sm">
                  <div>
                    <div className="font-medium text-slate-800">{item.label || item.type}</div>
                    <div className="text-xs text-slate-400">
                      {item.type} · {item.child?.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">{formatPence(item.pricing?.finalPrice)}</div>
                    <button className="text-xs text-red-500" onClick={() => handleRemove(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2 text-right text-sm font-semibold">
                Total: {formatPence(cart.total)}
              </div>
              <Button className="w-full" onClick={handleCheckout}>
                Checkout
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview ? `Preview — ${preview.label}` : ''}
        footer={
          preview && (
            <>
              <Button variant="secondary" onClick={() => setPreview(null)}>
                Close
              </Button>
              <Button onClick={() => handleAddToCart(preview.type, preview.entityId)}>Add to Cart</Button>
            </>
          )
        }
      >
        {previewLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
            <Spinner /> Loading preview…
          </div>
        ) : preview?.data ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              <strong>{preview.data.questionCount}</strong> question{preview.data.questionCount === 1 ? '' : 's'} in this bundle
              · Price: <strong>{formatPence(preview.price?.finalPrice)}</strong>
              {preview.price?.discountPercentage ? ` (${preview.price.discountPercentage}% off)` : ''}
            </div>
            {preview.data.questions?.map((q) => (
              <div key={q.id} className="rounded-lg border border-slate-100 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Badge className="bg-slate-100 text-slate-600">{q.type}</Badge>
                  {q.difficulty && <Badge className="bg-slate-100 text-slate-600">{q.difficulty}</Badge>}
                </div>
                <p className="text-sm text-slate-800">{q.questionText}</p>
                {q.options?.length > 0 && (
                  <ul className="mt-1 list-disc pl-5 text-xs text-slate-500">
                    {q.options.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
