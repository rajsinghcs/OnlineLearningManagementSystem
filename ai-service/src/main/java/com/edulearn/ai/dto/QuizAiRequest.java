package com.edulearn.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizAiRequest {
    private String content;
    private String topic;
    private Integer numberOfQuestions;
    private String difficulty; // EASY, MEDIUM, HARD
}
