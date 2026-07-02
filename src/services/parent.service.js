import axiosClient from '../api/axiosClient';

const listChildHomework = (childId, params = {}) =>
  axiosClient.get(`/homework/parent/child/${childId}`, { params }).then((res) => res.data.data);

const getChildHomeworkDetail = (childId, homeworkId) =>
  axiosClient.get(`/homework/child/${childId}/${homeworkId}`).then((res) => res.data.data);

const saveDraftAnswers = (childId, homeworkId, answers) =>
  axiosClient.post(`/homework/child/${childId}/${homeworkId}/draft`, { answers }).then((res) => res.data.data);

const submitHomework = (childId, homeworkId) =>
  axiosClient.post(`/homework/child/${childId}/${homeworkId}/submit`).then((res) => res.data.data);

const resubmitHomework = (childId, homeworkId, answers) =>
  axiosClient.post(`/homework/child/${childId}/${homeworkId}/resubmit`, { answers }).then((res) => res.data.data);

export { listChildHomework, getChildHomeworkDetail, saveDraftAnswers, submitHomework, resubmitHomework };
