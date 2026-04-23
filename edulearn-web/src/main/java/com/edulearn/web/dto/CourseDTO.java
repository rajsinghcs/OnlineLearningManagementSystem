package com.edulearn.web.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CourseDTO {
    private int courseId;
    private String title;
    private String description;
    private String category;
    private String level;
    private double price;
    private int instructorId;
    private String instructorName;
    private String thumbnailUrl;
    private int totalDuration;
    private boolean isPublished;
    private boolean isApproved;
    private String language;
    private LocalDate createdAt;
}
