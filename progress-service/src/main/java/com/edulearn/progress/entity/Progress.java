package com.edulearn.progress.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int progressId;

    @Column(nullable = false)
    private int studentId;

    @Column(nullable = false)
    private int courseId;

    @Column(nullable = false)
    private int lessonId;

    @Column(columnDefinition = "integer default 0")
    private int watchedSeconds;

    @Column(columnDefinition = "boolean default false")
    private boolean isCompleted;

    private LocalDateTime lastAccessedAt;

    private LocalDateTime completedAt;
}
