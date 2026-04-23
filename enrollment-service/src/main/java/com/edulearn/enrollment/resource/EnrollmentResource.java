package com.edulearn.enrollment.resource;

import com.edulearn.enrollment.entity.Enrollment;
import com.edulearn.enrollment.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/enrollments")
@RequiredArgsConstructor
public class EnrollmentResource {

    private final EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<Enrollment> enroll(@RequestParam int studentId, @RequestParam int courseId) {
        Enrollment enrollment = enrollmentService.enroll(studentId, courseId);
        return new ResponseEntity<>(enrollment, HttpStatus.CREATED);
    }

    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<Void> unenroll(@PathVariable int enrollmentId) {
        enrollmentService.unenroll(enrollmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByStudent(@PathVariable int studentId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(studentId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByCourse(@PathVariable int courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByCourse(courseId));
    }

    @PutMapping("/progress")
    public ResponseEntity<Void> updateProgress(@RequestParam int studentId, @RequestParam int courseId, @RequestParam int percent) {
        enrollmentService.updateProgress(studentId, courseId, percent);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Void> markComplete(@PathVariable("id") int enrollmentId) {
        enrollmentService.markComplete(enrollmentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> isEnrolled(@RequestParam int studentId, @RequestParam int courseId) {
        return ResponseEntity.ok(enrollmentService.isEnrolled(studentId, courseId));
    }

    @PostMapping("/{id}/certificate")
    public ResponseEntity<Void> issueCertificate(@PathVariable("id") int enrollmentId) {
        enrollmentService.issueCertificate(enrollmentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/count/{courseId}")
    public ResponseEntity<Integer> getEnrollmentCount(@PathVariable int courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentCount(courseId));
    }
}
