import { useEffect, useState } from 'react';
import { getMe } from '../../services/auth.service';
import {
  browseSubjects,
  browseTopics,
  browseSubtopics,
  getPrice,
  getCart,
  addCartItem,
  removeCartItem,
  checkoutCart,
} from '../../services/marketplace.service';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

function formatPence(p) {
  return p != null ? `£${(p / 100).toFixed(2)}` : '—';
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
  const [price, setPrice] = useState(null);

  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);

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

  useEffect(() => {
    setPrice(null);
    if (!subTopicId || !yearGroupId) return;
    getPrice({ type: 'SUBTOPIC', entityId: subTopicId, yearGroupId })
      .then(setPrice)
      .catch(() => setPrice(null));
  }, [subTopicId, yearGroupId]);

  function refreshCart() {
    setLoadingCart(true);
    getCart()
      .then(setCart)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoadingCart(false));
  }

  const handleAddToCart = async () => {
    try {
      await addCartItem({ type: 'SUBTOPIC', entityId: subTopicId, childId });
      toast.success('Added to cart');
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

          <Select label="Topic" value={topicId} disabled={!subjectId} onChange={(e) => setTopicId(e.target.value)}>
            <option value="">Select topic…</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>

          <Select label="Subtopic" value={subTopicId} disabled={!topicId} onChange={(e) => setSubTopicId(e.target.value)}>
            <option value="">Select subtopic…</option>
            {subtopics.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>

          {subjects.length === 0 && yearGroupId && (
            <EmptyState title="No published questions yet for this year group" subtitle="Ask an admin to publish some bank questions." />
          )}

          {price && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              Price: <strong>{formatPence(price.finalPrice)}</strong>{' '}
              {price.discountPercentage ? `(${price.discountPercentage}% off)` : ''}
            </div>
          )}

          <Button disabled={!subTopicId || !childId} onClick={handleAddToCart}>
            Add to Cart
          </Button>
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
                    <div className="text-xs text-slate-400">{item.child?.name}</div>
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
    </div>
  );
}
