package com.edulearn.enrollment.service.impl;

import com.edulearn.enrollment.entity.Enrollment;
import com.edulearn.enrollment.exception.AlreadyEnrolledException;
import com.edulearn.enrollment.exception.EnrollmentNotFoundException;
import com.edulearn.enrollment.repository.EnrollmentRepository;
import com.edulearn.enrollment.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;

    @Override
    public Enrollment enroll(int studentId, int courseId) {
        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new AlreadyEnrolledException("Student " + studentId + " is already enrolled in course " + courseId);
        }

        Enrollment enrollment = Enrollment.builder()
                .studentId(studentId)
                .courseId(courseId)
                .status("ACTIVE")
                .progressPercent(0)
                .enrolledAt(LocalDate.now())
                .certificateIssued(false)
                .build();

        return enrollmentRepository.save(enrollment);
    }

    @Override
    public void unenroll(int enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new EnrollmentNotFoundException("Enrollment not found with id: " + enrollmentId));
        
        enrollment.setStatus("CANCELLED");
        enrollmentRepository.save(enrollment);
    }

    @Override
    public List<Enrollment> getEnrollmentsByStudent(int studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    @Override
    public List<Enrollment> getEnrollmentsByCourse(int courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    @Override
    public void updateProgress(int studentId, int courseId, int percent) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new EnrollmentNotFoundException("Enrollment not found for student: " + studentId + " and course: " + courseId));
        
        enrollment.setProgressPercent(percent);
        
        if (percent == 100) {
            markComplete(enrollment.getEnrollmentId());
        } else {
            enrollmentRepository.save(enrollment);
        }
    }

    @Override
    public void markComplete(int enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new EnrollmentNotFoundException("Enrollment not found with id: " + enrollmentId));
        
        enrollment.setStatus("COMPLETED");
        enrollment.setCompletedAt(LocalDate.now());
        
        enrollmentRepository.save(enrollment);
    }

    @Override
    public boolean isEnrolled(int studentId, int courseId) {
        return enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
    }

    @Override
    public void issueCertificate(int enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new EnrollmentNotFoundException("Enrollment not found with id: " + enrollmentId));
        
        if (enrollment.getProgressPercent() == 100) {
            enrollment.setCertificateIssued(true);
            enrollmentRepository.save(enrollment);
        } else {
            throw new IllegalStateException("Cannot issue certificate: Course not fully completed.");
        }
    }

    @Override
    public int getEnrollmentCount(int courseId) {
        return enrollmentRepository.countByCourseId(courseId);
    }
}
