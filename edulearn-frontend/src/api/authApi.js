import { authAxios } from './axiosConfig';

export const authApi = {
  register: (userData) =>
    authAxios.post('/auth/register', userData),

  login: (credentials) =>
    authAxios.post('/auth/login', credentials),

  logout: () =>
    authAxios.post('/auth/logout'),

  getProfile: (userId) =>
    authAxios.get(`/auth/profile/${userId}`),

  updateProfile: (userId, data) =>
    authAxios.put(`/auth/profile/${userId}`, data),

  changePassword: (data) =>
    authAxios.put('/auth/password', data),

  getAllUsers: (role) =>
    authAxios.get(`/auth/users${role ? `?role=${role}` : ''}`),

  suspendUser: (userId) =>
    authAxios.put(`/auth/users/${userId}/suspend`),

  deleteUser: (userId) =>
    authAxios.delete(`/auth/delete/${userId}`),
};
