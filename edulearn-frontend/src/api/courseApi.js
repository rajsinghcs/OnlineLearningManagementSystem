import { courseAxios } from './axiosConfig';

export const courseApi = {
  getAllCourses: () =>
    courseAxios.get('/courses'),

  getAllCoursesAdmin: () =>
    courseAxios.get('/courses/all'),

  getCourseById: (id) =>
    courseAxios.get(`/courses/${id}`),

  getFeaturedCourses: () =>
    courseAxios.get('/courses/featured'),

  searchCourses: (keyword) =>
    courseAxios.get(`/courses/search?keyword=${keyword}`),

  getCoursesByCategory: (category) =>
    courseAxios.get(`/courses/category/${category}`),

  getCoursesByLevel: (level) =>
    courseAxios.get(`/courses/level/${level}`),

  getCoursesByInstructor: (instructorId) =>
    courseAxios.get(`/courses/instructor/${instructorId}`),

  createCourse: (data) =>
    courseAxios.post('/courses', data),

  updateCourse: (id, data) =>
    courseAxios.put(`/courses/${id}`, data),

  publishCourse: (id) =>
    courseAxios.put(`/courses/${id}/publish`),

  unpublishCourse: (id) =>
    courseAxios.put(`/courses/${id}/unpublish`),

  approveCourse: (id) =>
    courseAxios.put(`/courses/${id}/approve`),

  rejectCourse: (id) =>
    courseAxios.put(`/courses/${id}/reject`),

  deleteCourse: (id) =>
    courseAxios.delete(`/courses/${id}`),

  // Lesson APIs
  getLessonsByCourse: (courseId) =>
    courseAxios.get(`/lessons/course/${courseId}`),

  getLessonById: (lessonId) =>
    courseAxios.get(`/lessons/${lessonId}`),

  getPreviewLessons: (courseId) =>
    courseAxios.get(`/lessons/${courseId}/preview`),

  addLesson: (data) =>
    courseAxios.post('/lessons', data),

  updateLesson: (lessonId, data) =>
    courseAxios.put(`/lessons/${lessonId}`, data),

  deleteLesson: (lessonId) =>
    courseAxios.delete(`/lessons/${lessonId}`),

  reorderLessons: (lessons) =>
    courseAxios.put('/lessons/reorder', lessons),

  addResource: (lessonId, data) =>
    courseAxios.post(`/lessons/${lessonId}/resources`, data),

  getResources: (lessonId) =>
    courseAxios.get(`/lessons/${lessonId}/resources`),

  deleteResource: (resourceId) =>
    courseAxios.delete(`/lessons/resources/${resourceId}`),

  countLessons: (courseId) =>
    courseAxios.get(`/lessons/count/${courseId}`),
};
