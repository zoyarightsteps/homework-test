import axiosClient from '../api/axiosClient';

const getPrice = (params) =>
  axiosClient.get('/homework/parent/marketplace/price', { params }).then((res) => res.data.data);

const getPreview = (params) =>
  axiosClient.get('/homework/parent/marketplace/preview', { params }).then((res) => res.data.data);

const browseSubjects = (params = {}) =>
  axiosClient.get('/homework/parent/marketplace/subjects', { params }).then((res) => res.data.data);

const browseTopics = (params) =>
  axiosClient.get('/homework/parent/marketplace/topics', { params }).then((res) => res.data.data);

const browseSubtopics = (params) =>
  axiosClient.get('/homework/parent/marketplace/subtopics', { params }).then((res) => res.data.data);

const getPurchases = (params = {}) =>
  axiosClient.get('/homework/parent/marketplace/purchases', { params }).then((res) => res.data.data);

const checkAccess = (params) =>
  axiosClient.get('/homework/parent/marketplace/access', { params }).then((res) => res.data.data);

const getCart = () => axiosClient.get('/homework/parent/marketplace/cart').then((res) => res.data.data);

const addCartItem = (payload) =>
  axiosClient.post('/homework/parent/marketplace/cart/items', payload).then((res) => res.data.data);

const removeCartItem = (cartItemId) =>
  axiosClient.post('/homework/parent/marketplace/cart/items/remove', { cartItemId }).then((res) => res.data.data);

const checkoutCart = (payload) =>
  axiosClient.post('/homework/parent/marketplace/cart/checkout', payload).then((res) => res.data.data);

const getReviews = (params) =>
  axiosClient.get('/homework/parent/marketplace/reviews', { params }).then((res) => res.data.data);

const submitReview = (payload) =>
  axiosClient.post('/homework/parent/marketplace/reviews', payload).then((res) => res.data.data);

const editReview = (payload) =>
  axiosClient.post('/homework/parent/marketplace/reviews/edit', payload).then((res) => res.data.data);

const deleteReview = (payload) =>
  axiosClient.post('/homework/parent/marketplace/reviews/delete', payload).then((res) => res.data.data);

const browseBundles = (params) =>
  axiosClient.get('/homework/parent/marketplace/bundles', { params }).then((res) => res.data.data);

const getBundleDetail = (type, id, params) =>
  axiosClient.get(`/homework/parent/marketplace/bundles/${type}/${id}`, { params }).then((res) => res.data.data);

const getAlsoBought = (params) =>
  axiosClient.get('/homework/parent/marketplace/also-bought', { params }).then((res) => res.data.data);

export {
  getPrice,
  getPreview,
  browseSubjects,
  browseTopics,
  browseSubtopics,
  getPurchases,
  checkAccess,
  getCart,
  addCartItem,
  removeCartItem,
  checkoutCart,
  getReviews,
  submitReview,
  editReview,
  deleteReview,
  browseBundles,
  getBundleDetail,
  getAlsoBought,
};
