package com.edulearn.ai.service;

import com.edulearn.ai.dto.QuizAiRequest;
import com.edulearn.ai.dto.QuizAiResponse;
import com.edulearn.ai.dto.StudentQuestionRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    @Value("${google.gemini.api.key:}")
    private String apiKey;

    @Value("${google.gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
    private String apiUrl;

    public QuizAiResponse generateQuiz(QuizAiRequest request) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("YOUR_API_KEY")) {
            log.warn("Gemini API key is missing or default. Returning mock data.");
            return getMockResponse(request);
        }

        try {
            String prompt = buildPrompt(request);
            log.info("Calling Gemini API for topic: {}", request.getTopic());
            String responseBody = callGeminiApi(prompt);
            return parseGeminiResponse(responseBody);
        } catch (Exception e) {
            log.error("CRITICAL: AI Generation failed even with API key: {}", e.getMessage(), e);
            throw new RuntimeException("AI Generation failed: " + e.getMessage());
        }
    }

    private String buildPrompt(QuizAiRequest request) {
        return String.format(
            "Generate a quiz with %d questions about '%s' based on this content: '%s'. " +
            "Difficulty level: %s. " +
            "Return the output ONLY as a JSON object with the following structure: " +
            "{ \"title\": \"Quiz Title\", \"questions\": [ { \"questionText\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctOption\": \"Exact matching option from list\", \"explanation\": \"...\" } ] }",
            request.getNumberOfQuestions() != null ? request.getNumberOfQuestions() : 5,
            request.getTopic(),
            request.getContent() != null ? request.getContent() : request.getTopic(),
            request.getDifficulty() != null ? request.getDifficulty() : "MEDIUM"
        );
    }

    private String callGeminiApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        String urlWithKey = apiUrl + "?key=" + apiKey;

        return restTemplate.postForObject(urlWithKey, entity, String.class);
    }

    private QuizAiResponse parseGeminiResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        String aiText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        
        // Clean up markdown if AI returns ```json ... ```
        if (aiText.contains("```json")) {
            aiText = aiText.substring(aiText.indexOf("```json") + 7, aiText.lastIndexOf("```"));
        } else if (aiText.contains("```")) {
            aiText = aiText.substring(aiText.indexOf("```") + 3, aiText.lastIndexOf("```"));
        }

        return objectMapper.readValue(aiText.trim(), QuizAiResponse.class);
    }

    public String askTutor(StudentQuestionRequest request) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("YOUR_API_KEY")) {
            return "AI Tutor is currently in demo mode. Please provide a real API key to get personalized help.";
        }

        try {
            StringBuilder knowledgeBase = new StringBuilder();
            
            // 1. Process Main Lesson Content
            knowledgeBase.append("MAIN LESSON INFO:\n")
                        .append("Title: ").append(request.getLessonTitle()).append("\n")
                        .append("Description: ").append(request.getLessonContent()).append("\n");

            // 2. Process Main PDF if exists
            if ("PDF".equalsIgnoreCase(request.getContentType()) && request.getContentUrl() != null) {
                String pdfText = extractTextFromPdf(request.getContentUrl());
                if (pdfText != null) {
                    knowledgeBase.append("\n--- MAIN LESSON PDF CONTENT ---\n").append(pdfText).append("\n");
                }
            }

            // 3. Deep Scan All Attached Resources
            if (request.getResources() != null && !request.getResources().isEmpty()) {
                knowledgeBase.append("\n--- ATTACHED MATERIALS ---\n");
                for (StudentQuestionRequest.ResourceDto resource : request.getResources()) {
                    knowledgeBase.append("File: ").append(resource.getFileName()).append("\n");
                    if (resource.getFileUrl() != null && resource.getFileUrl().toLowerCase().endsWith(".pdf")) {
                        log.info("Deep scanning PDF attachment: {}", resource.getFileName());
                        String attachmentText = extractTextFromPdf(resource.getFileUrl());
                        if (attachmentText != null) {
                            knowledgeBase.append("Extracted Text from ").append(resource.getFileName()).append(":\n")
                                        .append(attachmentText).append("\n");
                        }
                    }
                }
            }

            String prompt = String.format(
                "You are an Advanced AI Tutor. Your goal is to provide a complete summary or answer based ON THE ACTUAL MATERIALS provided.\n\n" +
                "--- KNOWLEDGE BASE ---\n%s\n" +
                "CONTENT URL: %s\n\n" +
                "STUDENT QUESTION: %s\n\n" +
                "CRITICAL INSTRUCTIONS:\n" +
                "1. If the 'Description' in the Knowledge Base looks like junk text (random letters like 'kjrbhb'), IGNORE IT COMPLETELY.\n" +
                "2. PRIORITIZE the 'EXTRACTED TEXT' from PDFs and the 'CONTENT URL'.\n" +
                "3. If the material is a Video URL, use your internal knowledge of that video or the Course context to answer.\n" +
                "4. If you cannot access the video/PDF, do not just repeat the junk text. Instead, provide a helpful summary based on the Lesson Title and Course topic.",
                knowledgeBase.toString(),
                request.getContentUrl() != null ? request.getContentUrl() : "None",
                request.getStudentQuestion()
            );

            log.info("AI Tutor performing deep scan for: {}", request.getLessonTitle());
            String responseBody = callGeminiApi(prompt);
            return parsePlainTextResponse(responseBody);
        } catch (Exception e) {
            log.error("AI Tutor Deep Scan failed: {}", e.getMessage());
            return "I'm sorry, I'm having trouble analyzing the attached files right now. Please check if the files are valid PDFs.";
        }
    }

    private String extractTextFromPdf(String pdfUrl) {
        try (InputStream in = new URL(pdfUrl).openStream();
             PDDocument document = Loader.loadPDF(in.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (Exception e) {
            log.warn("Could not extract text from PDF {}: {}", pdfUrl, e.getMessage());
            return null;
        }
    }

    private String parsePlainTextResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
    }

    private QuizAiResponse getMockResponse(QuizAiRequest request) {
        QuizAiResponse response = new QuizAiResponse();
        int count = request.getNumberOfQuestions() != null ? request.getNumberOfQuestions() : 5;
        response.setTitle("AI Generated Quiz (Mock): " + (request.getTopic() != null ? request.getTopic() : "General"));
        
        List<QuizAiResponse.QuestionAiDto> questions = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            questions.add(new QuizAiResponse.QuestionAiDto(
                "Sample Question " + i + " about " + request.getTopic() + "?",
                List.of("Option A", "Option B", "Option C", "Option D"),
                "Option A",
                "Explanation for question " + i
            ));
        }
        
        response.setQuestions(questions);
        return response;
    }
}
