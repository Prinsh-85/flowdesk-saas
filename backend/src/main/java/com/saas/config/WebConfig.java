package com.saas.config;

import org.springframework.context.annotation.Configuration;

/**
 * MVC-level CORS is intentionally disabled here.
 * Spring Security's CorsConfigurationSource (in SecurityConfig) is the
 * single source of truth for CORS — having both active simultaneously
 * causes conflicting preflight responses.
 */
@Configuration
public class WebConfig {
    // CORS is managed by SecurityConfig.corsConfigurationSource()
}
