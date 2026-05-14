package com.qm.certificate.mapper;

import com.qm.certificate.dto.response.CertificateResponse;
import com.qm.certificate.entity.Certificate;

public class CertificateMapper {

    public static CertificateResponse toResponse(Certificate cert) {
        if (cert == null) return null;

        return CertificateResponse.builder()
                .certificateNumber(cert.getCertificateNumber())
                .studentName(cert.getStudentName())
                .courseName(cert.getCourseName())
                .grade(cert.getGrade())
                .issuedDate(cert.getIssuedDate())
                .status(cert.getStatus())
                .downloadUrl("/api/certificates/download/" + cert.getCertificateNumber())
                .verifyUrl("/verify/" + cert.getCertificateNumber())
                .build();
    }
}
