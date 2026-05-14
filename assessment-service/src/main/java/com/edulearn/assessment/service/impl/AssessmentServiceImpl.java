package com.edulearn.assessment.service.impl;

import com.edulearn.assessment.entity.Attempt;
import com.edulearn.assessment.entity.Question;
import com.edulearn.assessment.entity.Quiz;
import com.edulearn.assessment.repository.AttemptRepository;
import com.edulearn.assessment.repository.QuestionRepository;
import com.edulearn.assessment.repository.QuizRepository;
import com.edulearn.assessment.service.AssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssessmentServiceImpl implements AssessmentService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AttemptRepository attemptRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @Override
    @Transactional
    public Quiz createQuiz(Quiz quiz) {
        if (quiz.getIsPublished() == null) {
            quiz.setIsPublished(false);
        }
        return quizRepository.save(quiz);
    }

    @Override
    @Transactional
    public Question addQuestion(int quizId, Question question) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + quizId));
        question.setQuizId(quiz.getQuizId());
        return questionRepository.save(question);
    }

    @Override
    @Transactional
    public Attempt startAttempt(int quizId, int studentId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + quizId));

        if (!Boolean.TRUE.equals(quiz.getIsPublished())) {
            throw new RuntimeException("Cannot start attempt. Quiz is not published.");
        }

        int previousAttemptsCount = attemptRepository.countByStudentIdAndQuizId(studentId, quizId);
        if (quiz.getMaxAttempts() != null && previousAttemptsCount >= quiz.getMaxAttempts()) {
            throw new RuntimeException("Maximum attempts reached for this quiz.");
        }

        Attempt attempt = Attempt.builder()
                .quizId(quizId)
                .studentId(studentId)
                .startedAt(LocalDateTime.now())
                .build();

        return attemptRepository.save(attempt);
    }

    @Override
    @Transactional
    public Attempt submitAttempt(int attemptId, Map<Integer, String> answers) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found with id: " + attemptId));

        if (attempt.getSubmittedAt() != null) {
            throw new RuntimeException("Attempt already submitted.");
        }

        Quiz quiz = quizRepository.findById(attempt.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        List<Question> questions = questionRepository.findByQuizId(quiz.getQuizId());

        int totalScore = 0;
        int maxPossibleScore = 0;

        for (Question question : questions) {
            int marks = question.getMarks() != null ? question.getMarks() : 1;
            maxPossibleScore += marks;

            String studentAnswer = answers.get(question.getQuestionId());
            String correctAnswer = question.getCorrectAnswer();

            if (studentAnswer != null && correctAnswer != null 
                    && studentAnswer.trim().equalsIgnoreCase(correctAnswer.trim())) {
                totalScore += marks;
            }
        }

        double percentage = maxPossibleScore > 0 ? ((double) totalScore / maxPossibleScore) * 100 : 0;
        boolean passed = false;
        
        if (quiz.getPassingScore() != null) {
             passed = percentage >= quiz.getPassingScore();
        } else {
             passed = percentage >= 50; // default 50% if not set
        }

        attempt.setAnswers(answers);
        attempt.setScore((int) percentage); // Assuming score is percentage based on requirement. If it is raw score, we'd save totalScore. User said "Calculate percentage... Set attempt.score".
        attempt.setPassed(passed);
        attempt.setSubmittedAt(LocalDateTime.now());

        return attemptRepository.save(attempt);
    }

    @Override
    public List<Quiz> getQuizzesByCourse(int courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    @Override
    public List<Attempt> getAttemptsByStudent(int studentId) {
        return attemptRepository.findByStudentId(studentId);
    }

    @Override
    public List<Attempt> getAttemptsByQuiz(int quizId) {
        return attemptRepository.findByQuizId(quizId);
    }

    @Override
    public int getBestScore(int studentId, int quizId) {
        Optional<Attempt> bestAttempt = attemptRepository.findTopByStudentIdAndQuizIdOrderByScoreDesc(studentId, quizId);
        return bestAttempt.map(Attempt::getScore).orElse(0);
    }

    @Override
    public Quiz getQuiz(int quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + quizId));
    }

    @Override
    @Transactional
    public Quiz updateQuiz(Quiz quiz) {
        if (quiz.getQuizId() == null || !quizRepository.existsById(quiz.getQuizId())) {
            throw new RuntimeException("Quiz not found");
        }
        return quizRepository.save(quiz);
    }

    @Override
    @Transactional
    public void deleteQuiz(int quizId) {
        questionRepository.deleteByQuizId(quizId);
        quizRepository.deleteById(quizId);
    }

    @Override
    @Transactional
    public void publishQuiz(int quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        quiz.setIsPublished(true);
        quizRepository.save(quiz);

        // Notify enrolled students via discussion-notification-service
        try {
            // 1. Get enrolled user IDs from enrollment-service
            String enrollmentUrl = "http://ENROLLMENT-SERVICE/enrollments/course/" + quiz.getCourseId();
            List<?> enrollments = restTemplate.getForObject(enrollmentUrl, List.class);
            
            if (enrollments != null && !enrollments.isEmpty()) {
                java.util.List<Integer> studentIds = enrollments.stream()
                        .map(e -> {
                            Map<String, Object> map = (Map<String, Object>) e;
                            return (Integer) map.get("studentId");
                        })
                        .toList();

                // 2. Send bulk notification
                String title = "New Quiz: " + quiz.getTitle();
                String message = "A new quiz has been published in your course. Complete it to test your knowledge!";
                
                // Construct URL with query params for bulk notification
                String userIdsStr = studentIds.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining(","));
                String notificationUrl = "http://DISCUSSION-NOTIFICATION-SERVICE/notifications/bulk?userIds=" + userIdsStr + 
                        "&title=" + java.net.URLEncoder.encode(title, "UTF-8") + 
                        "&message=" + java.net.URLEncoder.encode(message, "UTF-8");
                
                restTemplate.postForEntity(notificationUrl, null, Void.class);
            }
        } catch (Exception e) {
            // Log error but don't fail the transaction (notification is secondary)
            System.err.println("Failed to send quiz notifications: " + e.getMessage());
        }
    }

    @Override
    public List<Question> getQuestionsByQuiz(int quizId) {
        return questionRepository.findByQuizIdOrderByOrderIndex(quizId);
    }

    @Override
    @Transactional
    public void resetAttempts(int quizId, int studentId) {
        attemptRepository.deleteByQuizIdAndStudentId(quizId, studentId);
    }
}
