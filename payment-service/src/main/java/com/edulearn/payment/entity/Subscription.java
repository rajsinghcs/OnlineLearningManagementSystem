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

import java.time.LocalDate;

@Entity
@Table(name = "subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer subscriptionId;

    @Column(nullable = false)
    private Integer studentId;

    private String plan; // FREE / MONTHLY / ANNUAL

    private LocalDate startDate;

    private LocalDate endDate;

    private String status; // ACTIVE / EXPIRED / CANCELLED

    private Double amountPaid;

    @Column(nullable = false)
    @Builder.Default
    private Boolean autoRenew = true;
}
