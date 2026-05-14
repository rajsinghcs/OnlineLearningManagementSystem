package com.qm.certificate.dto.response;

import com.qm.certificate.entity.Certificate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateResponse {
    private String certificateNumber;
    private String studentName;
    private String courseName;
    private String grade;
    private LocalDate issuedDate;
    private Certificate.CertificateStatus status;
    private String downloadUrl;
    private String verifyUrl;
}
