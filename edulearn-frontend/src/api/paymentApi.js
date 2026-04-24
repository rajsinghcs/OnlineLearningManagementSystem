import { paymentAxios } from './axiosConfig';

export const paymentApi = {
  processPayment: (data) =>
    paymentAxios.post('/payments', data),

  getPaymentsByStudent: (studentId) =>
    paymentAxios.get(`/payments/student/${studentId}`),

  getAllPayments: () =>
    paymentAxios.get('/payments/all'),

  getTotalRevenue: () =>
    paymentAxios.get('/payments/revenue'),

  refundPayment: (paymentId) =>
    paymentAxios.post(`/payments/${paymentId}/refund`),

  subscribe: (data) =>
    paymentAxios.post('/subscriptions', data),

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
