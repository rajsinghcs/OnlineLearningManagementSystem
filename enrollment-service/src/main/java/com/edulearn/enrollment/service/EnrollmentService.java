package com.edulearn.enrollment.service;

import com.edulearn.enrollment.entity.Enrollment;

import java.util.List;

public interface EnrollmentService {

    Enrollment enroll(int studentId, int courseId);

    void unenroll(int enrollmentId);

    List<Enrollment> getEnrollmentsByStudent(int studentId);

    List<Enrollment> getEnrollmentsByCourse(int courseId);

    void updateProgress(int studentId, int courseId, int percent);

    void markComplete(int enrollmentId);

    boolean isEnrolled(int studentId, int courseId);

    void issueCertificate(int enrollmentId);

    int getEnrollmentCount(int courseId);

}
