package com.edulearn.web.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class SubscriptionDTO {
    private int subscriptionId;
    private int studentId;
    private String plan;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private boolean autoRenew;
}
