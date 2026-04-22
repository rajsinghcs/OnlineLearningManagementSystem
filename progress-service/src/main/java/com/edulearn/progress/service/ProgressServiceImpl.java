package com.edulearn.progress.service;

import com.edulearn.progress.entity.Certificate;
import com.edulearn.progress.entity.Progress;
import com.edulearn.progress.repository.CertificateRepository;
import com.edulearn.progress.repository.ProgressRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProgressServiceImpl implements ProgressService {

    private final ProgressRepository progressRepository;
    private final CertificateRepository certificateRepository;
    private final RestTemplate restTemplate;

    private static final String LESSON_SERVICE_URL = "http://localhost:8080/lessons/course/";
    private static final String CERTIFICATES_DIR = "./certificates/";

    @Override
    public void trackProgress(int studentId, int courseId, int lessonId, int watchedSeconds) {
        Progress progress = progressRepository.findByStudentIdAndLessonId(studentId, lessonId)
                .orElse(Progress.builder()
                        .studentId(studentId)
                        .courseId(courseId)
                        .lessonId(lessonId)
                        .watchedSeconds(0)
                        .isCompleted(false)
                        .build());

        progress.setWatchedSeconds(progress.getWatchedSeconds() + watchedSeconds);
        progress.setLastAccessedAt(LocalDateTime.now());
        progressRepository.save(progress);
    }

    @Override
    public void markLessonComplete(int studentId, int courseId, int lessonId) {
        Progress progress = progressRepository.findByStudentIdAndLessonId(studentId, lessonId)
                .orElse(Progress.builder()
                        .studentId(studentId)
                        .courseId(courseId)
                        .lessonId(lessonId)
                        .watchedSeconds(0)
                        .build());

        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setLastAccessedAt(LocalDateTime.now());
        progressRepository.save(progress);
    }

    @Override
    public int getCourseProgress(int studentId, int courseId) {
        try {
            Object[] lessons = restTemplate.getForObject(LESSON_SERVICE_URL + courseId, Object[].class);
            int totalLessons = lessons != null ? lessons.length : 0;

            if (totalLessons == 0) {
                return 0; // Prevent division by zero
            }

            int completedLessons = progressRepository.countByStudentIdAndCourseIdAndIsCompleted(studentId, courseId, true);
            return (int) (((double) completedLessons / totalLessons) * 100);

        } catch (Exception e) {
            log.error("Error fetching course lessons from lesson-service for courseId: {}", courseId, e);
            return 0; // Return 0 if unable to calculate
        }
    }

    @Override
    public Optional<Progress> getLessonProgress(int studentId, int lessonId) {
        return progressRepository.findByStudentIdAndLessonId(studentId, lessonId);
    }

    @Override
    public Certificate issueCertificate(int studentId, int courseId) {
        int progress = getCourseProgress(studentId, courseId);
        if (progress < 100) {
            throw new RuntimeException("InsufficientProgressException: Course is not fully completed. Current progress: " + progress + "%");
        }

        if (certificateRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("Certificate already exists for studentId: " + studentId + " and courseId: " + courseId);
        }

        String verificationCode = UUID.randomUUID().toString();
        LocalDate issuedAt = LocalDate.now();
        
        // Simulating getting course and instructor names for the certificate
        String courseName = "Course " + courseId;
        String instructorName = "EduLearn Instructor";
        String studentName = "Student " + studentId; // Placeholder

        String pdfFileName = "certificate_" + studentId + "_" + courseId + ".pdf";
        String filePath = generatePdfCertificate(studentName, courseName, instructorName, issuedAt, verificationCode, pdfFileName);

        Certificate certificate = Certificate.builder()
                .studentId(studentId)
                .courseId(courseId)
                .issuedAt(issuedAt)
                .verificationCode(verificationCode)
                .instructorName(instructorName)
                .courseName(courseName)
                .certificateUrl(filePath)
                .build();

        return certificateRepository.save(certificate);
    }

    private String generatePdfCertificate(String studentName, String courseName, String instructorName, LocalDate issuedAt, String verificationCode, String fileName) {
        try {
            Path path = Paths.get(CERTIFICATES_DIR);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }

            String fullPath = CERTIFICATES_DIR + fileName;
            PdfWriter writer = new PdfWriter(fullPath);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("EduLearn Certificate of Completion")
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            document.add(new Paragraph("This is to certify that")
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph(studentName)
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(10));

            document.add(new Paragraph("has successfully completed the course")
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph(courseName)
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            document.add(new Paragraph("Instructor: " + instructorName)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));

            document.add(new Paragraph("Issue Date: " + issuedAt.toString())
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));

            document.add(new Paragraph("Verification Code: " + verificationCode)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.LEFT)
                    .setMarginTop(30));

            document.close();
            return new File(fullPath).getAbsolutePath();

        } catch (IOException e) {
            log.error("Failed to generate PDF certificate", e);
            throw new RuntimeException("Failed to generate certificate PDF", e);
        }
    }

    @Override
    public Optional<Certificate> getCertificate(int studentId, int courseId) {
        return certificateRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    @Override
    public Certificate verifyCertificate(String verificationCode) {
        return certificateRepository.findByVerificationCode(verificationCode)
                .orElseThrow(() -> new RuntimeException("Invalid verification code"));
    }

    @Override
    public List<Progress> getAllProgressByStudent(int studentId) {
        return progressRepository.findByStudentId(studentId);
    }
}
