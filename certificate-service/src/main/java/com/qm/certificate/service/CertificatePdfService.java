package com.qm.certificate.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.qm.certificate.entity.Certificate;
import com.qm.certificate.util.QrCodeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificatePdfService {

    private final TemplateEngine templateEngine;
    private final QrCodeUtil qrCodeUtil;

    @Value("${certificate.output-dir:certificates/}")
    private String outputDir;

    @Value("${certificate.verify-base-url:http://localhost:8085/verify}")
    private String verifyBaseUrl;

    public String generateAndSave(Certificate cert) {
        try {
            // a) Build verify URL
            String verifyUrl = verifyBaseUrl + "/" + cert.getCertificateNumber();

            // b) Call QrCodeUtil.generateBase64QrCode
            String qrCodeBase64 = qrCodeUtil.generateBase64QrCode(verifyUrl, 150, 150);

            // c) Build Thymeleaf Context
            Context ctx = new Context();
            ctx.setVariable("studentName", cert.getStudentName());
            ctx.setVariable("courseName", cert.getCourseName());
            ctx.setVariable("grade", cert.getGrade());
            ctx.setVariable("issuedDate", cert.getIssuedDate().toString());
            ctx.setVariable("certNumber", cert.getCertificateNumber());
            ctx.setVariable("qrCodeBase64", qrCodeBase64);

            // d) Call templateEngine.process
            String html = templateEngine.process("certificate", ctx);

            // e) Create output directory if not exists
            Path outputPath = Paths.get(outputDir);
            if (!Files.exists(outputPath)) {
                Files.createDirectories(outputPath);
            }

            // f) Build file path
            String fileName = cert.getCertificateNumber() + ".pdf";
            String filePath = outputDir + fileName;

            // g) Use PdfRendererBuilder
            try (OutputStream os = new FileOutputStream(filePath)) {
                PdfRendererBuilder builder = new PdfRendererBuilder();
                builder.useFastMode();
                builder.withHtmlContent(html, null);
                builder.toStream(os);
                builder.run();
            }

            // h) Log success
            log.info("Certificate generated successfully: {}", filePath);
            return filePath;

        } catch (Exception e) {
            // i) Wrap in try/catch → throw RuntimeException on failure
            log.error("Failed to generate certificate PDF", e);
            throw new RuntimeException("Could not generate certificate PDF", e);
        }
    }
}
