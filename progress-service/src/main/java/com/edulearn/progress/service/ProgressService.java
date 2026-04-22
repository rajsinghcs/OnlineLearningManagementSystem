package com.edulearn.progress.service;

import com.edulearn.progress.entity.Certificate;
import com.edulearn.progress.entity.Progress;

import java.util.List;
import java.util.Optional;

public interface ProgressService {

    void trackProgress(int studentId, int courseId, int lessonId, int watchedSeconds);

    void markLessonComplete(int studentId, int courseId, int lessonId);

    int getCourseProgress(int studentId, int courseId);

    Optional<Progress> getLessonProgress(int studentId, int lessonId);

    Certificate issueCertificate(int studentId, int courseId);

    Optional<Certificate> getCertificate(int studentId, int courseId);

    Certificate verifyCertificate(String verificationCode);

    List<Progress> getAllProgressByStudent(int studentId);
}
