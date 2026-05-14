import { paymentAxios } from './axiosConfig';

export const paymentApi = {
  processPayment: (data) =>
    paymentAxios.post('/payments', data),

  getPaymentsByStudent: (studentId) =>
    paymentAxios.get(`/payments/student/${studentId}`),

  getPaymentsByCourse: (courseId) =>
    paymentAxios.get(`/payments/course/${courseId}`),

  getAllPayments: () =>
    paymentAxios.get('/payments/all'),

  getTotalRevenue: () =>
    paymentAxios.get('/payments/revenue'),

  refundPayment: (paymentId) =>
    paymentAxios.post(`/payments/${paymentId}/refund`),

  subscribe: ({ studentId, planType, transactionId, mode }) =>
    paymentAxios.post(`/subscriptions?studentId=${studentId}&plan=${planType}${transactionId ? `&transactionId=${transactionId}` : ''}${mode ? `&mode=${mode}` : ''}`, {}),

  requestRefund: (subscriptionId) =>
    paymentAxios.post(`/subscriptions/${subscriptionId}/request-refund`),

  approveRefund: (paymentId) =>
    paymentAxios.post(`/payments/${paymentId}/approve-refund`),

  cancelSubscription: (subscriptionId) =>
    paymentAxios.delete(`/subscriptions/${subscriptionId}`),

  renewSubscription: (subscriptionId) =>
    paymentAxios.put(`/subscriptions/${subscriptionId}/renew`),

  getSubscriptionByStudent: (studentId) =>
    paymentAxios.get(`/subscriptions/student/${studentId}`),

  isSubscriptionActive: (studentId) =>
    paymentAxios.get(`/subscriptions/active/${studentId}`),

  getAllSubscriptions: () =>
    paymentAxios.get('/subscriptions/all'),
};
