package com.edulearn.web.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CertificateDTO {
    private int certificateId;
    private int studentId;
    private int courseId;
    private String courseName;
    private String instructorName;
    private LocalDate issuedAt;
    private String certificateUrl;
    private String verificationCode;
}
