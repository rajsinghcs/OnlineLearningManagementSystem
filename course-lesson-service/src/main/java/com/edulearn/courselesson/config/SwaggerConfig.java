package com.edulearn.courselesson.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI courseLessonServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Course-Lesson Service API")
                        .description("EduLearn LMS Course and Lesson Service API Documentation")
                        .version("v1.0.0"));
    }
}
