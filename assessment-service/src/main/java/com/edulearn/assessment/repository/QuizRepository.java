package com.edulearn.assessment.repository;

import com.edulearn.assessment.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {
    List<Quiz> findByCourseId(int courseId);
    Optional<Quiz> findByQuizId(int quizId);
    List<Quiz> findByIsPublished(boolean isPublished);
    int countByCourseId(int courseId);
}
