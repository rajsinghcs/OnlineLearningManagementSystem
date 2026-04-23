package com.edulearn.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

    public JwtAuthFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // Public endpoints — skip JWT check
            List<String> publicPaths = List.of(
                "/api/auth/register",
                "/api/auth/login",
                "/api/courses",
                "/api/certificates/verify"
            );

            String path = request.getURI().getPath();
            boolean isPublic = publicPaths.stream()
                .anyMatch(path::startsWith);

            if (isPublic) {
                return chain.filter(exchange);
            }

            // Check Authorization header
            if (!request.getHeaders().containsKey("Authorization")) {
                ServerHttpResponse response = exchange.getResponse();
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return response.setComplete();
            }

            String token = request.getHeaders().getFirst("Authorization");

            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                // Forward token to downstream service
                // Each service validates its own JWT
                ServerHttpRequest modifiedRequest = request.mutate()
                    .header("Authorization", "Bearer " + token)
                    .build();
                return chain.filter(exchange.mutate().request(modifiedRequest).build());
            }

            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return response.setComplete();
        };
    }

    public static class Config {
    }
}
