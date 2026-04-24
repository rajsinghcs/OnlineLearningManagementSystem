package com.edulearn.discnotif.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int notificationId;

    @Column(nullable = false)
    private int userId;

    @Column(nullable = false)
    private String type; // ENROLLMENT / PAYMENT / QUIZ_RESULT / CERTIFICATE / COURSE_PUBLISHED / SYSTEM

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Builder.Default
    private boolean isRead = false;

    private LocalDateTime createdAt;

    private int relatedEntityId;
    private String relatedEntityType; // COURSE/QUIZ/CERTIFICATE

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
