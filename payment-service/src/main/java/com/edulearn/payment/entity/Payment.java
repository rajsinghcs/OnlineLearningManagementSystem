package com.edulearn.payment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer paymentId;

    @Column(nullable = false)
    private Integer studentId;

    @Column(nullable = false)
    private Integer courseId;

    @Column(nullable = false)
    private Double amount;

    private String status; // PENDING / SUCCESS / FAILED / REFUNDED

    private String mode; // CARD / WALLET / UPI

    @Column(unique = true)
    private String transactionId;

    private LocalDateTime paidAt;

    @Column(nullable = false)
    @Builder.Default
    private String currency = "INR";
}
