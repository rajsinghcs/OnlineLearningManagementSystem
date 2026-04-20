package com.edulearn.assessment.service;

import com.edulearn.assessment.entity.Attempt;
import com.edulearn.assessment.entity.Question;
import com.edulearn.assessment.entity.Quiz;

import java.util.List;
import java.util.Map;

public interface AssessmentService {
    Quiz createQuiz(Quiz quiz);
    Question addQuestion(int quizId, Question question);
    Attempt startAttempt(int quizId, int studentId);
    Attempt submitAttempt(int attemptId, Map<Integer, String> answers);
    List<Quiz> getQuizzesByCourse(int courseId);
    List<Attempt> getAttemptsByStudent(int studentId);
    List<Attempt> getAttemptsByQuiz(int quizId);
    int getBestScore(int studentId, int quizId);
    Quiz getQuiz(int quizId);
    Quiz updateQuiz(Quiz quiz);
    void deleteQuiz(int quizId);
    void publishQuiz(int quizId);
    List<Question> getQuestionsByQuiz(int quizId);
}
