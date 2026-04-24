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
public class Reply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int replyId;

    @Column(nullable = false)
    private int threadId;

    @Column(nullable = false)
    private int authorId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Builder.Default
    private boolean isAccepted = false;

    @Builder.Default
    private int upvotes = 0;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
