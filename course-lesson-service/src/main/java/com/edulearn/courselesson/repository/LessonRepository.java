package com.edulearn.courselesson.repository;

import com.edulearn.courselesson.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Integer> {

    List<Lesson> findByCourseId(int courseId);

    Optional<Lesson> findByLessonId(int lessonId);

    List<Lesson> findByCourseIdOrderByOrderIndex(int courseId);

    List<Lesson> findByContentType(String contentType);

    List<Lesson> findByCourseIdAndIsPreview(int courseId, boolean isPreview);

    int countByCourseId(int courseId);
}
