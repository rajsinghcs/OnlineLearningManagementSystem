package com.edulearn.progress.repository;

import com.edulearn.progress.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Integer> {

    List<Progress> findByStudentIdAndCourseId(int studentId, int courseId);

    Optional<Progress> findByStudentIdAndLessonId(int studentId, int lessonId);

    int countByStudentIdAndCourseIdAndIsCompleted(int studentId, int courseId, boolean isCompleted);

    List<Progress> findByStudentId(int studentId);
}
