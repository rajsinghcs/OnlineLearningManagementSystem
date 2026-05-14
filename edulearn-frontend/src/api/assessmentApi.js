import { assessmentAxios } from './axiosConfig';

export const assessmentApi = {
  createQuiz: (data) =>
    assessmentAxios.post('/quizzes', data),

  getQuizzesByCourse: (courseId) =>
    assessmentAxios.get(`/quizzes/course/${courseId}`),

  getQuizById: (quizId) =>
    assessmentAxios.get(`/quizzes/${quizId}`),

  updateQuiz: (quizId, data) =>
    assessmentAxios.put(`/quizzes/${quizId}`, data),

  deleteQuiz: (quizId) =>
    assessmentAxios.delete(`/quizzes/${quizId}`),

  publishQuiz: (quizId) =>
    assessmentAxios.put(`/quizzes/${quizId}/publish`),

  addQuestion: (quizId, data) =>
    assessmentAxios.post(`/quizzes/${quizId}/questions`, data),

  getQuestions: (quizId) =>
    assessmentAxios.get(`/quizzes/${quizId}/questions`),

  startAttempt: (quizId, studentId) =>
    assessmentAxios.post(`/attempts/start/${quizId}?studentId=${studentId}`),

  submitAttempt: (attemptId, answers) =>
    assessmentAxios.post(`/attempts/${attemptId}/submit`, answers),

  getAttemptsByStudent: (studentId) =>
    assessmentAxios.get(`/attempts/student/${studentId}`),

  getBestScore: (studentId, quizId) =>
    assessmentAxios.get(`/attempts/best?studentId=${studentId}&quizId=${quizId}`),

  resetAttempts: (quizId, studentId) =>
    assessmentAxios.delete(`/attempts/quiz/${quizId}/student/${studentId}`),
};
