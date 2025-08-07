package com.crowdaid.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Value("${server.servlet.context-path:/}")
    private String contextPath;

    @Value("${spring.application.name:API}")
    private String appName;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        securitySchemeName,
                                        new SecurityScheme()
                                                .name(securitySchemeName)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                )
                .info(
                        new Info()
                                .title(appName + " API Documentation")
                                .description("""
                                        ## CrowdAid Emergency Response Platform API
                                        
                                        This is the backend API documentation for the CrowdAid Emergency Response Platform.
                                        The API provides endpoints for user authentication, help requests, and real-time messaging.
                                        
                                        ### Authentication
                                        Most endpoints require authentication. Include the JWT token in the `Authorization` header.
                                        
                                        Example: `Authorization: Bearer your-jwt-token`
                                        
                                        ### Error Handling
                                        The API uses standard HTTP status codes to indicate the success or failure of an API request.
                                        
                                        | Status Code | Description |
                                        |-------------|-------------|
                                        | 200 | OK - The request has succeeded |
                                        | 201 | Created - Resource created successfully |
                                        | 400 | Bad Request - Invalid request format |
                                        | 401 | Unauthorized - Authentication required |
                                        | 403 | Forbidden - Insufficient permissions |
                                        | 404 | Not Found - Resource not found |
                                        | 500 | Internal Server Error - Server error |
                                        
                                        ### Rate Limiting
                                        The API is rate limited to prevent abuse. By default, the rate limit is set to 1000 requests per hour per IP address.
                                        """)
                                .version("1.0.0")
                                .contact(
                                        new Contact()
                                                .name("CrowdAid Support")
                                                .email("support@crowdaid.com")
                                                .url("https://crowdaid.com/support")
                                )
                                .license(
                                        new License()
                                                .name("Apache 2.0")
                                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")
                                )
                )
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080" + contextPath)
                                .description("Development Server"),
                        new Server()
                                .url("https://api.crowdaid.com" + contextPath)
                                .description("Production Server")
                ));
    }
}
