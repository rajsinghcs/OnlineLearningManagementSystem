package com.edulearn.payment.service;

import com.edulearn.payment.entity.Payment;
import com.edulearn.payment.entity.Subscription;

import java.util.List;
import java.util.Optional;

public interface PaymentService {

    Payment processPayment(Payment payment);

    List<Payment> getPaymentsByStudent(int studentId);

    List<Payment> getPaymentsByCourse(int courseId);

    Subscription subscribe(int studentId, String plan, String transactionId, String mode);

    Payment requestRefund(int subscriptionId);

    void cancelSubscription(int subscriptionId);

    Subscription renewSubscription(int subscriptionId);

    Optional<Subscription> getSubscriptionByStudent(int studentId);

    boolean isSubscriptionActive(int studentId);

    Payment refundPayment(int paymentId);

    Double getTotalRevenue();

    List<Payment> getAllPayments();

    List<Subscription> getAllSubscriptions();
}
