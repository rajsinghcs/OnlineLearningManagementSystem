package com.edulearn.enrollment.repository;

import com.edulearn.enrollment.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {

    List<Enrollment> findByStudentId(int studentId);

    List<Enrollment> findByCourseId(int courseId);

    Optional<Enrollment> findByStudentIdAndCourseId(int studentId, int courseId);

    boolean existsByStudentIdAndCourseId(int studentId, int courseId);

    List<Enrollment> findByStatus(String status);

    int countByCourseId(int courseId);

    @Query("SELECT e FROM Enrollment e WHERE e.studentId = :studentId AND e.status = 'COMPLETED'")
    List<Enrollment> findCompletedByStudentId(@Param("studentId") int studentId);
}
