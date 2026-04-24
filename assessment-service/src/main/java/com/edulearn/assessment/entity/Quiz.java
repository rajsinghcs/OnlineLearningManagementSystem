package com.edulearn.assessment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer quizId;

    @Column(nullable = false)
    private Integer courseId;

    private String title;

    @Column(length = 1000)
    private String description;

    private Integer timeLimitMinutes;

    private Integer passingScore; // percentage e.g. 60

    private Integer maxAttempts;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean isPublished = false;
}
