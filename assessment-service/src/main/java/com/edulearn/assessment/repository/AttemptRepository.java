package com.edulearn.assessment.repository;

import com.edulearn.assessment.entity.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, Integer> {
    List<Attempt> findByStudentId(int studentId);
    List<Attempt> findByQuizId(int quizId);
    List<Attempt> findByStudentIdAndQuizId(int studentId, int quizId);
    int countByStudentIdAndQuizId(int studentId, int quizId);
    Optional<Attempt> findTopByStudentIdAndQuizIdOrderByScoreDesc(int studentId, int quizId);
}
