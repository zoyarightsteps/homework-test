import axiosClient from '../api/axiosClient';

const browseCurriculum = (params = {}) =>
  axiosClient.get('/homework/tutor/curriculum', { params }).then((res) => res.data.data);

export { browseCurriculum };
