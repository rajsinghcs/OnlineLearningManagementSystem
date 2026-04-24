import { progressAxios } from './axiosConfig';

export const progressApi = {
  trackProgress: (data) =>
    progressAxios.post('/progress/track', data),

  markLessonComplete: (data) =>
    progressAxios.put('/progress/complete', data),

  getCourseProgress: (studentId, courseId) =>
    progressAxios.get(`/progress/course/${studentId}/${courseId}`),

  getLessonProgress: (studentId, lessonId) =>
    progressAxios.get(`/progress/lesson/${studentId}/${lessonId}`),

  getAllProgress: (studentId) =>
    progressAxios.get(`/progress/student/${studentId}`),

  issueCertificate: (data) =>
    progressAxios.post('/certificates/issue', data),

  getCertificate: (studentId, courseId) =>
    progressAxios.get(`/certificates/${studentId}/${courseId}`),

  verifyCertificate: (code) =>
    progressAxios.get(`/certificates/verify/${code}`),

  getAllCertificates: () =>
    progressAxios.get('/certificates/all'),
};
