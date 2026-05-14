package com.qm.certificate.service;

import com.qm.certificate.dto.request.IssueCertificateRequest;
import com.qm.certificate.dto.response.CertificateResponse;
import com.qm.certificate.entity.Certificate;
import com.qm.certificate.exception.CertificateNotFoundException;
import com.qm.certificate.exception.CertificateRevokedException;
import com.qm.certificate.mapper.CertificateMapper;
import com.qm.certificate.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class CertificateService {

    private final CertificateRepository repository;
    private final CertificatePdfService pdfService;

    @Transactional
    public CertificateResponse request(IssueCertificateRequest request) {
        // Generate certNumber: "REQ-" + year + "-" + padded sequence
        long count = repository.count() + 1;
        String year = String.valueOf(LocalDate.now().getYear());
        String certNumber = String.format("REQ-%s-%05d", year, count);

        Certificate cert = Certificate.builder()
                .certificateNumber(certNumber)
                .studentId(request.getStudentId())
                .studentName(request.getStudentName())
                .studentEmail(request.getStudentEmail())
                .courseName(request.getCourseName())
                .grade(request.getGrade())
                .issuedDate(LocalDate.now())
                .status(Certificate.CertificateStatus.REQUESTED)
                .build();

        Certificate savedCert = repository.save(cert);
        return CertificateMapper.toResponse(savedCert);
    }

    @Transactional
    public CertificateResponse approve(String certNumber) {
        log.info("Processing approval for certificate number: {}", certNumber);
        Certificate cert = repository.findByCertificateNumber(certNumber)
                .orElseThrow(() -> new CertificateNotFoundException("Request not found: " + certNumber));

        if (cert.getStatus() != Certificate.CertificateStatus.REQUESTED) {
            throw new RuntimeException("Certificate is not in REQUESTED status");
        }

        // Update number to final CERT format
        long count = repository.count(); // Use same sequence or keep the number?
        // Let's keep the number or change REQ to CERT
        String newCertNumber = cert.getCertificateNumber().replace("REQ-", "CERT-");
        cert.setCertificateNumber(newCertNumber);
        cert.setStatus(Certificate.CertificateStatus.ISSUED);
        cert.setIssuedDate(LocalDate.now());

        // Generate and save PDF
        String pdfPath = pdfService.generateAndSave(cert);
        cert.setPdfPath(pdfPath);

        Certificate savedCert = repository.save(cert);
        return CertificateMapper.toResponse(savedCert);
    }

    @Transactional
    public CertificateResponse issue(IssueCertificateRequest request) {
        // Direct issue (for backward compatibility or direct admin action)
        CertificateResponse response = request(request);
        return approve(response.getCertificateNumber());
    }

    public CertificateResponse verify(String certNumber) {
        Certificate cert = repository.findByCertificateNumber(certNumber)
                .orElseThrow(() -> new CertificateNotFoundException("Certificate not found with number: " + certNumber));

        if (cert.getStatus() == Certificate.CertificateStatus.REVOKED) {
            throw new CertificateRevokedException("This certificate has been revoked and is no longer valid.");
        }

        return CertificateMapper.toResponse(cert);
    }

    public Resource downloadPdf(String certNumber) {
        Certificate cert = repository.findByCertificateNumber(certNumber)
                .orElseThrow(() -> new CertificateNotFoundException("Certificate not found with number: " + certNumber));

        try {
            Path path = Paths.get(cert.getPdfPath());
            Resource resource = new UrlResource(path.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read the file!");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    public List<CertificateResponse> getByStudent(String studentId) {
        return repository.findByStudentId(studentId).stream()
                .map(CertificateMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CertificateResponse revoke(String certNumber) {
        Certificate cert = repository.findByCertificateNumber(certNumber)
                .orElseThrow(() -> new CertificateNotFoundException("Certificate not found with number: " + certNumber));

        cert.setStatus(Certificate.CertificateStatus.REVOKED);
        Certificate updatedCert = repository.save(cert);
        return CertificateMapper.toResponse(updatedCert);
    }
}
