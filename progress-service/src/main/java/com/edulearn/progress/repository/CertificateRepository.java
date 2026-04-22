package com.edulearn.progress.repository;

import com.edulearn.progress.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Integer> {

    List<Certificate> findByStudentId(int studentId);

    Optional<Certificate> findByStudentIdAndCourseId(int studentId, int courseId);

    Optional<Certificate> findByVerificationCode(String code);

    boolean existsByStudentIdAndCourseId(int studentId, int courseId);
}
