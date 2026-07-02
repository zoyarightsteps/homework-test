import axiosClient from '../api/axiosClient';

const checkCanAssign = (sessionId) =>
  axiosClient.get(`/homework/tutor/sessions/${sessionId}/can-assign`).then((res) => res.data.data);

const listTutorHomeworks = (params = {}) =>
  axiosClient.get('/homework/tutor', { params }).then((res) => res.data.data);

const getTutorHomeworkDetail = (homeworkId) =>
  axiosClient.get(`/homework/tutor/${homeworkId}`).then((res) => res.data.data);

const createHomeworkDraft = (payload) =>
  axiosClient.post('/homework', payload).then((res) => res.data.data);

const addQuestions = (homeworkId, questions) =>
  axiosClient.post(`/homework/${homeworkId}/questions`, { questions }).then((res) => res.data.data);

const assignHomework = (homeworkId, payload) =>
  axiosClient.post(`/homework/${homeworkId}/assign`, payload).then((res) => res.data.data);

const cancelHomework = (homeworkId) =>
  axiosClient.post(`/homework/${homeworkId}/cancel`).then((res) => res.data.data);

const deleteDraft = (homeworkId) =>
  axiosClient.post(`/homework/${homeworkId}/delete-draft`).then((res) => res.data.data);

const gradeHomework = (homeworkId, payload) =>
  axiosClient.post(`/homework/${homeworkId}/grade`, payload).then((res) => res.data.data);

const revertHomework = (homeworkId, questions) =>
  axiosClient.post(`/homework/${homeworkId}/revert`, { questions }).then((res) => res.data.data);

const browseBankQuestions = (params) =>
  axiosClient.get('/homework/question-bank/questions', { params }).then((res) => res.data.data);

const getBankQuestionDetail = (bankQuestionId) =>
  axiosClient.get(`/homework/question-bank/questions/${bankQuestionId}`).then((res) => res.data.data);

export {
  checkCanAssign,
  listTutorHomeworks,
  getTutorHomeworkDetail,
  createHomeworkDraft,
  addQuestions,
  assignHomework,
  cancelHomework,
  deleteDraft,
  gradeHomework,
  revertHomework,
  browseBankQuestions,
  getBankQuestionDetail,
};
