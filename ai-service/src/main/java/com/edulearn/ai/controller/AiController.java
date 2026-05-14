package com.edulearn.ai.controller;

import com.edulearn.ai.dto.QuizAiRequest;
import com.edulearn.ai.dto.QuizAiResponse;
import com.edulearn.ai.dto.StudentQuestionRequest;
import com.edulearn.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/generate-quiz")
    public ResponseEntity<QuizAiResponse> generateQuiz(@RequestBody QuizAiRequest request) {
        return ResponseEntity.ok(aiService.generateQuiz(request));
    }

    @PostMapping("/ask-question")
    public ResponseEntity<Map<String, String>> askQuestion(@RequestBody StudentQuestionRequest request) {
        String answer = aiService.askTutor(request);
        return ResponseEntity.ok(Map.of("answer", answer));
    }
}
