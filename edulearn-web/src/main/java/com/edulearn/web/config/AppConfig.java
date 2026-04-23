package com.edulearn.web.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Value("${auth.service.url}")
    private String authServiceUrl;

    @Value("${course.service.url}")
    private String courseServiceUrl;

    @Value("${enrollment.service.url}")
    private String enrollmentServiceUrl;

    @Value("${assessment.service.url}")
    private String assessmentServiceUrl;

    @Value("${payment.service.url}")
    private String paymentServiceUrl;

    @Value("${progress.service.url}")
    private String progressServiceUrl;

    @Value("${discnotif.service.url}")
    private String discnotifServiceUrl;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public String authUrl() {
        return authServiceUrl;
    }

    @Bean
    public String courseUrl() {
        return courseServiceUrl;
    }

    @Bean
    public String enrollmentUrl() {
        return enrollmentServiceUrl;
    }

    @Bean
    public String assessmentUrl() {
        return assessmentServiceUrl;
    }

    @Bean
    public String paymentUrl() {
        return paymentServiceUrl;
    }

    @Bean
    public String progressUrl() {
        return progressServiceUrl;
    }

    @Bean
    public String discnotifUrl() {
        return discnotifServiceUrl;
    }
}
