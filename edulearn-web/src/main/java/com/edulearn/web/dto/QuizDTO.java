package com.edulearn.web.dto;

import lombok.Data;

@Data
public class QuizDTO {
    private int quizId;
    private int courseId;
    private String title;
    private int timeLimitMinutes;
    private int passingScore;
    private int maxAttempts;
    private boolean isPublished;
}
