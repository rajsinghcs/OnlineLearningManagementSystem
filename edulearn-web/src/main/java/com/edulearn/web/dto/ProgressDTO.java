package com.edulearn.web.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProgressDTO {
    private int progressId;
    private int studentId;
    private int courseId;
    private int lessonId;
    private int watchedSeconds;
    private boolean isCompleted;
    private LocalDateTime lastAccessedAt;
}
