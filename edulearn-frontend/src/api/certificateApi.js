import { certificateAxios } from './axiosConfig';

export const certificateApi = {
  issue: (data) =>
    certificateAxios.post('/certificates/issue', data),

  getById: (certNo) =>
    certificateAxios.get(`/certificates/verify/${certNo}`),

  getByStudent: (studentId) =>
    certificateAxios.get(`/certificates/student/${studentId}`),

  download: (certNo) =>
    certificateAxios.get(`/certificates/download/${certNo}`, {
      responseType: 'blob'
    }),

  request: (data) =>
    certificateAxios.post('/certificates/request', data),

  approve: (certNo) =>
    certificateAxios.post(`/certificates/approve/${certNo}`)
};
