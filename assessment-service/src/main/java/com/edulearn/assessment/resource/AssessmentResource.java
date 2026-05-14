package com.edulearn.assessment.resource;

import com.edulearn.assessment.entity.Attempt;
import com.edulearn.assessment.entity.Question;
import com.edulearn.assessment.entity.Quiz;
import com.edulearn.assessment.service.AssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class AssessmentResource {

    private final AssessmentService assessmentService;

    @PostMapping("/quizzes")
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        return new ResponseEntity<>(assessmentService.createQuiz(quiz), HttpStatus.CREATED);
    }

    @GetMapping("/quizzes/course/{courseId}")
    public ResponseEntity<List<Quiz>> getQuizzesByCourse(@PathVariable int courseId) {
        return ResponseEntity.ok(assessmentService.getQuizzesByCourse(courseId));
    }

    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable int quizId) {
        return ResponseEntity.ok(assessmentService.getQuiz(quizId));
    }

    @PutMapping("/quizzes/{quizId}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable int quizId, @RequestBody Quiz quiz) {
        quiz.setQuizId(quizId);
        return ResponseEntity.ok(assessmentService.updateQuiz(quiz));
    }

    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable int quizId) {
        assessmentService.deleteQuiz(quizId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/quizzes/{quizId}/publish")
    public ResponseEntity<Void> publishQuiz(@PathVariable int quizId) {
        assessmentService.publishQuiz(quizId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<Question> addQuestion(@PathVariable int quizId, @RequestBody Question question) {
        return new ResponseEntity<>(assessmentService.addQuestion(quizId, question), HttpStatus.CREATED);
    }

    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<List<Question>> getQuestionsByQuiz(@PathVariable int quizId) {
        return ResponseEntity.ok(assessmentService.getQuestionsByQuiz(quizId));
    }

    @PostMapping("/attempts/start/{quizId}")
    public ResponseEntity<Attempt> startAttempt(@PathVariable int quizId, @RequestParam int studentId) {
        return new ResponseEntity<>(assessmentService.startAttempt(quizId, studentId), HttpStatus.CREATED);
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<Attempt> submitAttempt(@PathVariable int attemptId, @RequestBody Map<Integer, String> answers) {
        return ResponseEntity.ok(assessmentService.submitAttempt(attemptId, answers));
    }

    @GetMapping("/attempts/student/{studentId}")
    public ResponseEntity<List<Attempt>> getAttemptsByStudent(@PathVariable int studentId) {
        return ResponseEntity.ok(assessmentService.getAttemptsByStudent(studentId));
    }

    @GetMapping("/attempts/quiz/{quizId}")
    public ResponseEntity<List<Attempt>> getAttemptsByQuiz(@PathVariable int quizId) {
        return ResponseEntity.ok(assessmentService.getAttemptsByQuiz(quizId));
    }

    @GetMapping("/attempts/best")
    public ResponseEntity<Integer> getBestScore(@RequestParam int studentId, @RequestParam int quizId) {
        return ResponseEntity.ok(assessmentService.getBestScore(studentId, quizId));
    }

    @DeleteMapping("/attempts/quiz/{quizId}/student/{studentId}")
    public ResponseEntity<Void> resetAttempts(@PathVariable int quizId, @PathVariable int studentId) {
        assessmentService.resetAttempts(quizId, studentId);
        return ResponseEntity.noContent().build();
    }
}
