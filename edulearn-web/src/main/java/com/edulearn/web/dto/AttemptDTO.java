package com.edulearn.web.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttemptDTO {
    private int attemptId;
    private int quizId;
    private int studentId;
    private int score;
    private boolean passed;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
}
