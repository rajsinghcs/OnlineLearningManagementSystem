package com.edulearn.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizAiResponse {
    private String title;
    private List<QuestionAiDto> questions;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class QuestionAiDto {
        private String questionText;
        private List<String> options;
        private String correctOption;
        private String explanation;
    }
}
