package com.edulearn.discnotif.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EduLearn Discussion & Notification Service API")
                        .version("1.0")
                        .description("API documentation for the Discussion Forum and Notification management microservice of EduLearn LMS.")
                        .contact(new Contact()
                                .name("EduLearn Support")
                                .email("support@edulearn.com")));
    }
}
