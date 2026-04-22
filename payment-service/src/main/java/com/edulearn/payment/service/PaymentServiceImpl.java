package com.edulearn.payment.service;

import com.edulearn.payment.entity.Payment;
import com.edulearn.payment.entity.Subscription;
import com.edulearn.payment.repository.PaymentRepository;
import com.edulearn.payment.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Override
    @Transactional
    public Payment processPayment(Payment payment) {
        if (payment.getTransactionId() != null) {
            Optional<Payment> existing = paymentRepository.findByTransactionId(payment.getTransactionId());
            if (existing.isPresent()) {
                throw new RuntimeException("Payment with transactionId already exists");
            }
        }
        payment.setPaidAt(LocalDateTime.now());
        payment.setStatus("SUCCESS");
        return paymentRepository.save(payment);
    }

    @Override
    public List<Payment> getPaymentsByStudent(int studentId) {
        return paymentRepository.findByStudentId(studentId);
    }

    @Override
    public List<Payment> getPaymentsByCourse(int courseId) {
        return paymentRepository.findByCourseId(courseId);
    }

    @Override
    @Transactional
    public Subscription subscribe(int studentId, String plan) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate;

        switch (plan.toUpperCase()) {
            case "FREE":
                endDate = startDate.plusYears(30);
                break;
            case "MONTHLY":
                endDate = startDate.plusMonths(1);
                break;
            case "ANNUAL":
                endDate = startDate.plusYears(1);
                break;
            default:
                throw new IllegalArgumentException("Invalid plan type");
        }

        Subscription subscription = Subscription.builder()
                .studentId(studentId)
                .plan(plan.toUpperCase())
                .startDate(startDate)
                .endDate(endDate)
                .status("ACTIVE")
                .autoRenew(true)
                .amountPaid(plan.equalsIgnoreCase("FREE") ? 0.0 : getAmountForPlan(plan))
                .build();

        return subscriptionRepository.save(subscription);
    }

    private Double getAmountForPlan(String plan) {
        if ("MONTHLY".equalsIgnoreCase(plan)) return 9.99;
        if ("ANNUAL".equalsIgnoreCase(plan)) return 99.99;
        return 0.0;
    }

    @Override
    @Transactional
    public void cancelSubscription(int subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        subscription.setStatus("CANCELLED");
        subscription.setAutoRenew(false);
        subscriptionRepository.save(subscription);
    }

    @Override
    @Transactional
    public Subscription renewSubscription(int subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        LocalDate newEndDate = subscription.getEndDate() != null && subscription.getEndDate().isAfter(LocalDate.now()) ?
                subscription.getEndDate() : LocalDate.now();

        switch (subscription.getPlan().toUpperCase()) {
            case "FREE":
                newEndDate = newEndDate.plusYears(30);
                break;
            case "MONTHLY":
                newEndDate = newEndDate.plusMonths(1);
                break;
            case "ANNUAL":
                newEndDate = newEndDate.plusYears(1);
                break;
        }

        subscription.setEndDate(newEndDate);
        subscription.setStatus("ACTIVE");
        return subscriptionRepository.save(subscription);
    }

    @Override
    public Optional<Subscription> getSubscriptionByStudent(int studentId) {
        // Here we could return the most recent active one, but let's just return what the repo gives.
        // Assuming there's only one active subscription per student at a time.
        return subscriptionRepository.findByStudentIdAndStatus(studentId, "ACTIVE");
    }

    @Override
    public boolean isSubscriptionActive(int studentId) {
        Optional<Subscription> subscriptionOpt = subscriptionRepository.findByStudentIdAndStatus(studentId, "ACTIVE");
        if (subscriptionOpt.isPresent()) {
            Subscription sub = subscriptionOpt.get();
            return sub.getEndDate() != null && sub.getEndDate().isAfter(LocalDate.now());
        }
        return false;
    }

    @Override
    @Transactional
    public Payment refundPayment(int paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus("REFUNDED");
        return paymentRepository.save(payment);
    }

    @Override
    public Double getTotalRevenue() {
        Double total = paymentRepository.getTotalRevenue();
        return total != null ? total : 0.0;
    }
}
