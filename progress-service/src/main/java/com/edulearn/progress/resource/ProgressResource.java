package com.edulearn.progress.resource;

import com.edulearn.progress.dto.CourseProgressResponse;
import com.edulearn.progress.entity.Certificate;
import com.edulearn.progress.entity.Progress;
import com.edulearn.progress.service.ProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Progress & Certificates", description = "Endpoints for tracking student progress and issuing certificates")
public class ProgressResource {

    private final ProgressService progressService;

    @PostMapping("/progress/track")
    @Operation(summary = "Track watch time", description = "Update the seconds watched by a student for a specific lesson")
    public ResponseEntity<Void> trackProgress(@RequestParam int studentId, @RequestParam int courseId, @RequestParam int lessonId, @RequestParam int watchedSeconds) {
        progressService.trackProgress(studentId, courseId, lessonId, watchedSeconds);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/progress/complete")
    @Operation(summary = "Mark lesson complete", description = "Mark a specific lesson as completed for a student")
    public ResponseEntity<Void> markLessonComplete(@RequestParam int studentId, @RequestParam int courseId, @RequestParam int lessonId) {
        progressService.markLessonComplete(studentId, courseId, lessonId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/progress/course/{studentId}/{courseId}")
    @Operation(summary = "Get course progress", description = "Get the completion percentage for a course")
    public ResponseEntity<Integer> getCourseProgress(@PathVariable int studentId, @PathVariable int courseId) {
        int progress = progressService.getCourseProgress(studentId, courseId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/progress/course-details/{studentId}/{courseId}")
    public ResponseEntity<CourseProgressResponse> getDetailedCourseProgress(@PathVariable int studentId, @PathVariable int courseId) {
        return ResponseEntity.ok(progressService.getDetailedCourseProgress(studentId, courseId));
    }

    @PostMapping("/progress/sync/{studentId}/{courseId}")
    @Operation(summary = "Sync progress", description = "Recalculate and push progress to enrollment-service")
    public ResponseEntity<Void> syncProgress(@PathVariable int studentId, @PathVariable int courseId) {
        progressService.syncProgress(studentId, courseId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/progress/lesson/{studentId}/{lessonId}")
    public ResponseEntity<Progress> getLessonProgress(@PathVariable int studentId, @PathVariable int lessonId) {
        return progressService.getLessonProgress(studentId, lessonId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/progress/student/{studentId}")
    public ResponseEntity<List<Progress>> getAllProgressByStudent(@PathVariable int studentId) {
        return ResponseEntity.ok(progressService.getAllProgressByStudent(studentId));
    }

    @PostMapping("/certificates/issue")
    @Operation(summary = "Issue certificate", description = "Generate and save a PDF certificate if course progress is 100%")
    public ResponseEntity<Certificate> issueCertificate(@RequestParam int studentId, @RequestParam int courseId) {
        try {
            Certificate certificate = progressService.issueCertificate(studentId, courseId);
            return ResponseEntity.status(HttpStatus.CREATED).body(certificate);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/certificates/{studentId}/{courseId}")
    public ResponseEntity<Certificate> getCertificate(@PathVariable int studentId, @PathVariable int courseId) {
        return progressService.getCertificate(studentId, courseId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/certificates/verify/{code}")
    @Operation(summary = "Verify certificate", description = "Verify a certificate using its unique verification code")
    public ResponseEntity<Certificate> verifyCertificate(@PathVariable String code) {
        try {
            Certificate certificate = progressService.verifyCertificate(code);
            return ResponseEntity.ok(certificate);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
