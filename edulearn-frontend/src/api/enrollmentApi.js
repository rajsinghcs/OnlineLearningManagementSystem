import { enrollmentAxios } from './axiosConfig';

export const enrollmentApi = {
  enroll: (data) =>
    enrollmentAxios.post('/enrollments', data),

  unenroll: (enrollmentId) =>
    enrollmentAxios.delete(`/enrollments/${enrollmentId}`),

  getByStudent: (studentId) =>
    enrollmentAxios.get(`/enrollments/student/${studentId}`),

  getByCourse: (courseId) =>
    enrollmentAxios.get(`/enrollments/course/${courseId}`),

  updateProgress: (data) =>
    enrollmentAxios.put('/enrollments/progress', data),

  markComplete: (enrollmentId) =>
    enrollmentAxios.put(`/enrollments/${enrollmentId}/complete`),

  isEnrolled: (studentId, courseId) =>
    enrollmentAxios.get(`/enrollments/check?studentId=${studentId}&courseId=${courseId}`),

  issueCertificate: (enrollmentId) =>
    enrollmentAxios.post(`/enrollments/${enrollmentId}/certificate`),

  getEnrollmentCount: (courseId) =>
    enrollmentAxios.get(`/enrollments/count/${courseId}`),
};
