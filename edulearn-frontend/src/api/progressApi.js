import { progressAxios } from './axiosConfig';

export const progressApi = {
  trackProgress: (data) =>
    progressAxios.post('/progress/track', null, {
      params: {
        studentId: data.userId || data.studentId,
        courseId: data.courseId,
        lessonId: data.lessonId,
        watchedSeconds: data.progressSeconds || data.watchedSeconds
      }
    }),

  markLessonComplete: (data) =>
    progressAxios.put('/progress/complete', null, {
      params: {
        studentId: data.userId || data.studentId,
        courseId: data.courseId,
        lessonId: data.lessonId
      }
    }),

  getCourseProgress: (studentId, courseId) =>
    progressAxios.get(`/progress/course-details/${studentId}/${courseId}`),

  getLessonProgress: (studentId, lessonId) =>
    progressAxios.get(`/progress/lesson/${studentId}/${lessonId}`),

  getAllProgress: (studentId) =>
    progressAxios.get(`/progress/student/${studentId}`),

  issueCertificate: (data) =>
    progressAxios.post('/certificates/issue', null, {
      params: {
        studentId: data.userId || data.studentId,
        courseId: data.courseId
      }
    }),

  getCertificate: (studentId, courseId) =>
    progressAxios.get(`/certificates/${studentId}/${courseId}`),

  verifyCertificate: (code) =>
    progressAxios.get(`/certificates/verify/${code}`),

  syncProgress: (studentId, courseId) =>
    progressAxios.post(`/progress/sync/${studentId}/${courseId}`),

  getAllCertificates: () =>
    progressAxios.get('/certificates/all'),
};
