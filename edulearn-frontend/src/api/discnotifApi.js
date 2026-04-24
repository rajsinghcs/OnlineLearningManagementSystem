import { discnotifAxios } from './axiosConfig';

export const discnotifApi = {
  createThread: (data) =>
    discnotifAxios.post('/threads', data),

  getThreadsByCourse: (courseId) =>
    discnotifAxios.get(`/threads/course/${courseId}`),

  getThreadsByLesson: (lessonId) =>
    discnotifAxios.get(`/threads/lesson/${lessonId}`),

  searchThreads: (keyword) =>
    discnotifAxios.get(`/threads/search?keyword=${keyword}`),

  deleteThread: (threadId) =>
    discnotifAxios.delete(`/threads/${threadId}`),

  pinThread: (threadId) =>
    discnotifAxios.put(`/threads/${threadId}/pin`),

  closeThread: (threadId) =>
    discnotifAxios.put(`/threads/${threadId}/close`),

  postReply: (data) =>
    discnotifAxios.post('/replies', data),

  getRepliesByThread: (threadId) =>
    discnotifAxios.get(`/replies/thread/${threadId}`),

  upvoteReply: (replyId) =>
    discnotifAxios.put(`/replies/${replyId}/upvote`),

  acceptReply: (replyId) =>
    discnotifAxios.put(`/replies/${replyId}/accept`),

  deleteReply: (replyId) =>
    discnotifAxios.delete(`/replies/${replyId}`),

  sendNotification: (data) =>
    discnotifAxios.post('/notifications/send', data),

  sendBulkNotification: (data) =>
    discnotifAxios.post('/notifications/bulk', data),

  getNotifications: (userId) =>
    discnotifAxios.get(`/notifications/user/${userId}`),

  markAsRead: (notificationId) =>
    discnotifAxios.put(`/notifications/${notificationId}/read`),

  markAllRead: (userId) =>
    discnotifAxios.put(`/notifications/user/${userId}/readAll`),

  getUnreadCount: (userId) =>
    discnotifAxios.get(`/notifications/user/${userId}/count`),

  deleteNotification: (id) =>
    discnotifAxios.delete(`/notifications/${id}`),
};
