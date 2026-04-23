package com.edulearn.web.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EnrollmentDTO {
    private int enrollmentId;
    private int studentId;
    private int courseId;
    private String courseTitle;
    private String courseThumbnail;
    private LocalDate enrolledAt;
    private String status;
    private int progressPercent;
    private boolean certificateIssued;
}
