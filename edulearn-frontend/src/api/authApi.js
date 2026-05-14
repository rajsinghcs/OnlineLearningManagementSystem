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
    authAxios.put(`/auth/suspend/${userId}`),

  unsuspendUser: (userId) =>
    authAxios.put(`/auth/unsuspend/${userId}`),

  oauth2Login: (payload) =>
    authAxios.post('/auth/oauth2/login', payload),

  verifyInstructor: (userId) =>
    authAxios.put(`/auth/verify/${userId}`),

  approveInstructor: (userId) =>
    authAxios.put(`/auth/admin/approve-instructor/${userId}`),

  getPendingInstructors: () =>
    authAxios.get('/auth/admin/pending-instructors'),

  deleteUser: (userId) =>
    authAxios.delete(`/auth/delete/${userId}`),

  forgotPassword: (email) =>
    authAxios.post('/auth/forgot-password', { email }),

  resetPassword: (data) =>
    authAxios.post('/auth/reset-password', data),
};
