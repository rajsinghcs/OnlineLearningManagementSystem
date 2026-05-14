package com.edulearn.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class JwtAuthGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthGatewayFilterFactory.Config> {

    public JwtAuthGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();
            HttpMethod method = request.getMethod();

            // Preflight / OPTIONS requests — skip JWT check
            if (HttpMethod.OPTIONS.equals(method)) {
                return chain.filter(exchange);
            }

            // Public endpoints — skip JWT check
            boolean isAuthPublic = path.contains("/auth/login") || 
                                   path.contains("/auth/register") || 
                                   path.contains("/auth/verify-email") || 
                                   path.contains("/auth/forgot-password") || 
                                   path.contains("/auth/reset-password") || 
                                   path.contains("/auth/oauth2/login");
            
            boolean isCoursePublic = path.contains("/courses") && 
                                     HttpMethod.GET.equals(method) && 
                                     !path.contains("/approve") && 
                                     !path.contains("/reject");
            
            boolean isLessonPublic = path.contains("/lessons") && 
                                     HttpMethod.GET.equals(method) && 
                                     (path.contains("/preview") || path.contains("/course/") || path.contains("/count/"));
            
            boolean isCertVerify = path.contains("/certificates/verify");

            System.out.println("DEBUG Gateway: Path=" + path + " Method=" + method + " isAuthPublic=" + isAuthPublic + " isCoursePublic=" + isCoursePublic);

            if (isAuthPublic || isCoursePublic || isLessonPublic || isCertVerify) {
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
                
                // Parse JWT role to enforce RBAC
                try {
                    String[] parts = token.split("\\.");
                    if (parts.length == 3) {
                        String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(payload);
                        String role = node.has("role") ? node.get("role").asText() : "";

                        // Admin Only Check
                        boolean isAdminOnly = path.startsWith("/api/auth/users") ||
                                              path.startsWith("/api/auth/admin") ||
                                              path.startsWith("/api/auth/suspend") ||
                                              path.startsWith("/api/auth/unsuspend") ||
                                              path.startsWith("/api/payments/revenue") ||
                                              path.startsWith("/api/notifications/bulk") ||
                                              path.startsWith("/api/certificates/approve") ||
                                              path.startsWith("/api/certificates/revoke") ||
                                              path.startsWith("/api/certificates/issue") ||
                                              (path.startsWith("/api/courses") && (path.endsWith("/approve") || path.endsWith("/reject")));

                        if (isAdminOnly && !"ADMIN".equalsIgnoreCase(role)) {
                            ServerHttpResponse response = exchange.getResponse();
                            response.setStatusCode(HttpStatus.FORBIDDEN);
                            return response.setComplete();
                        }

                        boolean isMutatingMethod = HttpMethod.POST.equals(method) || HttpMethod.PUT.equals(method) || HttpMethod.DELETE.equals(method) || HttpMethod.PATCH.equals(method);
                        boolean isInstructorOrAdminPath = path.startsWith("/api/courses") || path.startsWith("/api/lessons") || path.startsWith("/api/quizzes");

                        if (!isAdminOnly && isInstructorOrAdminPath && isMutatingMethod) {
                            if (!"ADMIN".equalsIgnoreCase(role) && !"INSTRUCTOR".equalsIgnoreCase(role)) {
                                ServerHttpResponse response = exchange.getResponse();
                                response.setStatusCode(HttpStatus.FORBIDDEN);
                                return response.setComplete();
                            }
                        }
                    }
                } catch (Exception e) {
                    // Ignore parsing error, downstream will reject if completely invalid
                }

                // Forward token to downstream service
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
