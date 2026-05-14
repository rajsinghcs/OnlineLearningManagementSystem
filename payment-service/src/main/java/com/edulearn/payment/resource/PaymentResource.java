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
@CrossOrigin(origins = "*")
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

    @GetMapping("/payments/all")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/subscriptions/all")
    public ResponseEntity<List<Subscription>> getAllSubscriptions() {
        return ResponseEntity.ok(paymentService.getAllSubscriptions());
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
    public ResponseEntity<Subscription> subscribe(
            @RequestParam int studentId, 
            @RequestParam String plan,
            @RequestParam(required = false) String transactionId,
            @RequestParam(required = false) String mode) {
        return new ResponseEntity<>(paymentService.subscribe(studentId, plan, transactionId, mode), HttpStatus.CREATED);
    }

    @PostMapping("/subscriptions/{subscriptionId}/request-refund")
    public ResponseEntity<Payment> requestRefund(@PathVariable int subscriptionId) {
        return ResponseEntity.ok(paymentService.requestRefund(subscriptionId));
    }

    @PostMapping("/payments/{paymentId}/approve-refund")
    public ResponseEntity<Payment> approveRefund(@PathVariable int paymentId) {
        return ResponseEntity.ok(paymentService.refundPayment(paymentId));
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
