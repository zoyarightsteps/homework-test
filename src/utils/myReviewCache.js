const keyFor = (bundleType, entityId) => `my_review:${bundleType}:${entityId}`;

const saveMyReview = (bundleType, entityId, review) => {
  try {
    localStorage.setItem(keyFor(bundleType, entityId), JSON.stringify(review));
  } catch {}
};

const getMyReview = (bundleType, entityId) => {
  try {
    const raw = localStorage.getItem(keyFor(bundleType, entityId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearMyReview = (bundleType, entityId) => {
  try {
    localStorage.removeItem(keyFor(bundleType, entityId));
  } catch {}
};

export { saveMyReview, getMyReview, clearMyReview };
