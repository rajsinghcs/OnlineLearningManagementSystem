package com.qm.certificate.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Certificate Generation API")
                        .version("1.0.0")
                        .description("API for generating high-quality PDF certificates with QR code support using Thymeleaf and OpenHTMLtoPDF"));
    }
}
