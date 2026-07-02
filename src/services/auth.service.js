import axiosClient from '../api/axiosClient';

const login = (email, password) =>
  axiosClient.post('/auth/login', { email, password }).then((res) => res.data.data);

const getMe = () => axiosClient.get('/auth/me').then((res) => res.data.data);

const logout = () => axiosClient.post('/auth/logout').then((res) => res.data);

export { login, getMe, logout };
