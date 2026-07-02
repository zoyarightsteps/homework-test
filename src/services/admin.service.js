import axiosClient from '../api/axiosClient';

const createBankQuestion = (payload) =>
  axiosClient.post('/homework/admin/question-bank/questions', payload).then((res) => res.data.data);

const listBankQuestions = (params = {}) =>
  axiosClient.get('/homework/admin/question-bank/questions', { params }).then((res) => res.data.data);

const updateBankQuestion = (bankQuestionId, payload) =>
  axiosClient
    .post(`/homework/admin/question-bank/questions/${bankQuestionId}/update`, payload)
    .then((res) => res.data.data);

const publishBankQuestion = (bankQuestionId) =>
  axiosClient
    .post(`/homework/admin/question-bank/questions/${bankQuestionId}/publish`)
    .then((res) => res.data.data);

const unpublishBankQuestion = (bankQuestionId) =>
  axiosClient
    .post(`/homework/admin/question-bank/questions/${bankQuestionId}/unpublish`)
    .then((res) => res.data.data);

const deactivateBankQuestion = (bankQuestionId) =>
  axiosClient
    .post(`/homework/admin/question-bank/questions/${bankQuestionId}/deactivate`)
    .then((res) => res.data.data);

export {
  createBankQuestion,
  listBankQuestions,
  updateBankQuestion,
  publishBankQuestion,
  unpublishBankQuestion,
  deactivateBankQuestion,
};
