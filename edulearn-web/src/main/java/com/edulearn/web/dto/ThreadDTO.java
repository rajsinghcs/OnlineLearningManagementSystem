package com.edulearn.web.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ThreadDTO {
    private int threadId;
    private int courseId;
    private int lessonId;
    private int authorId;
    private String authorName;
    private String title;
    private String body;
    private boolean isPinned;
    private boolean isClosed;
    private LocalDateTime createdAt;
}
