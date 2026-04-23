package com.edulearn.web.dto;

import lombok.Data;

@Data
public class LessonDTO {
    private int lessonId;
    private int courseId;
    private String title;
    private String contentType;
    private String contentUrl;
    private int durationMinutes;
    private int orderIndex;
    private String description;
    private boolean isPreview;
}
