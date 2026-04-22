package com.edulearn.payment.resource;

import com.edulearn.payment.entity.Payment;
import com.edulearn.payment.entity.Subscription;
import com.edulearn.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PaymentResource {

    private final PaymentService paymentService;

    // --- Payments Endpoints ---

    @PostMapping("/payments")
    public ResponseEntity<Payment> processPayment(@RequestBody Payment payment) {
        return new ResponseEntity<>(paymentService.processPayment(payment), HttpStatus.CREATED);
    }

    @GetMapping("/payments/student/{studentId}")
    public ResponseEntity<List<Payment>> getPaymentsByStudent(@PathVariable int studentId) {
        return ResponseEntity.ok(paymentService.getPaymentsByStudent(studentId));
    }

    @GetMapping("/payments/course/{courseId}")
    public ResponseEntity<List<Payment>> getPaymentsByCourse(@PathVariable int courseId) {
        return ResponseEntity.ok(paymentService.getPaymentsByCourse(courseId));
    }

    @GetMapping("/payments/revenue")
    public ResponseEntity<Double> getTotalRevenue() {
        return ResponseEntity.ok(paymentService.getTotalRevenue());
    }

    @PostMapping("/payments/{paymentId}/refund")
    public ResponseEntity<Payment> refundPayment(@PathVariable int paymentId) {
        return ResponseEntity.ok(paymentService.refundPayment(paymentId));
    }

    // --- Subscriptions Endpoints ---

    @PostMapping("/subscriptions")
    public ResponseEntity<Subscription> subscribe(@RequestParam int studentId, @RequestParam String plan) {
        return new ResponseEntity<>(paymentService.subscribe(studentId, plan), HttpStatus.CREATED);
    }

    @DeleteMapping("/subscriptions/{subscriptionId}")
    public ResponseEntity<Void> cancelSubscription(@PathVariable int subscriptionId) {
        paymentService.cancelSubscription(subscriptionId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/subscriptions/{subscriptionId}/renew")
    public ResponseEntity<Subscription> renewSubscription(@PathVariable int subscriptionId) {
        return ResponseEntity.ok(paymentService.renewSubscription(subscriptionId));
    }

    @GetMapping("/subscriptions/student/{studentId}")
    public ResponseEntity<Subscription> getSubscriptionByStudent(@PathVariable int studentId) {
        return paymentService.getSubscriptionByStudent(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/subscriptions/active/{studentId}")
    public ResponseEntity<Boolean> isSubscriptionActive(@PathVariable int studentId) {
        return ResponseEntity.ok(paymentService.isSubscriptionActive(studentId));
    }
}
