package com.qm.certificate.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueCertificateRequest {

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotBlank(message = "Student Name is required")
    private String studentName;

    @NotBlank(message = "Student Email is required")
    private String studentEmail;

    @NotBlank(message = "Course Name is required")
    private String courseName;

    @NotBlank(message = "Grade is required")
    private String grade;
}
