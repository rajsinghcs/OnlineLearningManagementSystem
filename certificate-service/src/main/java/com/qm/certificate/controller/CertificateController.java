package com.qm.certificate.controller;

import com.qm.certificate.dto.request.IssueCertificateRequest;
import com.qm.certificate.dto.response.CertificateResponse;
import com.qm.certificate.service.CertificateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@RestController
@RequestMapping("/certificates")
@RequiredArgsConstructor
@Tag(name = "Certificates", description = "Endpoints for managing and generating student certificates")
@Slf4j
public class CertificateController {

    private final CertificateService service;

    @PostMapping("/issue")
    @Operation(summary = "Issue a new certificate", description = "Generates a PDF certificate and stores certificate details")
    public ResponseEntity<CertificateResponse> issue(@Valid @RequestBody IssueCertificateRequest request) {
        log.info("Directly issuing certificate for student: {} in course: {}", request.getStudentId(), request.getCourseName());
        return new ResponseEntity<>(service.issue(request), HttpStatus.CREATED);
    }

    @PostMapping("/request")
    @Operation(summary = "Request a certificate", description = "Creates a certificate request that needs admin approval")
    public ResponseEntity<CertificateResponse> request(@Valid @RequestBody IssueCertificateRequest request) {
        log.info("New certificate request received for student: {} in course: {}", request.getStudentId(), request.getCourseName());
        return new ResponseEntity<>(service.request(request), HttpStatus.CREATED);
    }

    @RequestMapping(value = "/approve/{certNo}", method = {RequestMethod.POST, RequestMethod.PATCH})
    @Operation(summary = "Approve a certificate request", description = "Admin approves a request and generates the PDF")
    public ResponseEntity<CertificateResponse> approve(@PathVariable String certNo) {
        log.info("Approving certificate request: {}", certNo);
        return ResponseEntity.ok(service.approve(certNo));
    }

    @GetMapping("/verify/{certNo}")
    @Operation(summary = "Verify a certificate", description = "Public endpoint to check if a certificate is valid and not revoked")
    public ResponseEntity<CertificateResponse> verify(@PathVariable String certNo) {
        return ResponseEntity.ok(service.verify(certNo));
    }

    @GetMapping("/download/{certNo}")
    @Operation(summary = "Download certificate PDF", description = "Returns the generated PDF file for the given certificate number")
    public ResponseEntity<Resource> downloadPdf(@PathVariable String certNo) {
        Resource file = service.downloadPdf(certNo);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + certNo + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get certificates by student", description = "Returns a list of all certificates issued to a specific student")
    public ResponseEntity<List<CertificateResponse>> getByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(service.getByStudent(studentId));
    }

    @PatchMapping("/revoke/{certNo}")
    @Operation(summary = "Revoke a certificate", description = "Marks a certificate as revoked, making it invalid for verification")
    public ResponseEntity<CertificateResponse> revoke(@PathVariable String certNo) {
        return ResponseEntity.ok(service.revoke(certNo));
    }
}
