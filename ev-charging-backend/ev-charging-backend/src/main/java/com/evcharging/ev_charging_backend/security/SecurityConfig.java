package com.evcharging.ev_charging_backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // =========================================================
    // Authentication Manager
    // =========================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {

        return authConfig.getAuthenticationManager();
    }

    // =========================================================
    // Security Filter Chain
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http

                // -------------------------------------------------
                // CORS
                // -------------------------------------------------
                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource())
                )

                // -------------------------------------------------
                // CSRF
                // -------------------------------------------------
                .csrf(AbstractHttpConfigurer::disable)

                // -------------------------------------------------
                // Session Management
                // JWT is stateless
                // -------------------------------------------------
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // -------------------------------------------------
                // Authorization Rules
                // -------------------------------------------------
                .authorizeHttpRequests(auth -> auth

                        // =========================================
                        // OPTIONS requests
                        // Required for browser CORS preflight
                        // =========================================
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // =========================================
                        // NORMAL USER AUTHENTICATION
                        // Login + Register
                        // =========================================
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // =========================================
                        // ADMIN AUTHENTICATION
                        // Admin Login
                        // =========================================
                        .requestMatchers(
                                "/api/admin/auth/**"
                        ).permitAll()

                        // =========================================
                        // SWAGGER / OPENAPI
                        // =========================================
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // =========================================
                        // ADMIN APIs
                        // ONLY ADMIN CAN ACCESS
                        // =========================================
                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        // =========================================
                        // EVERYTHING ELSE
                        // Requires authentication
                        // =========================================
                        .anyRequest().authenticated()
                )

                // -------------------------------------------------
                // JWT Filter
                // -------------------------------------------------
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // =========================================================
    // CORS Configuration
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
                "http://localhost:5175",
                "http://127.0.0.1:5175"
        ));

        configuration.setAllowedMethods(Arrays.asList(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials"
        ));

        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }}