package com.edulearn.web.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaymentDTO {
    private int paymentId;
    private int studentId;
    private int courseId;
    private double amount;
    private String status;
    private String mode;
    private String transactionId;
    private LocalDateTime paidAt;
}
