package com.edulearn.ai.dto;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentQuestionRequest {
    private String lessonTitle;
    private String lessonContent;
    private String studentQuestion;
    private String contentUrl;
    private String contentType;
    private List<ResourceDto> resources;

    @Data
    public static class ResourceDto {
        private String fileName;
        private String fileUrl;
    }
}
