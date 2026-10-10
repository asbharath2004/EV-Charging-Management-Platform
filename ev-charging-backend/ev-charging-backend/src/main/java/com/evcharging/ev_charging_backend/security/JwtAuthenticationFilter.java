package com.evcharging.ev_charging_backend.security;

import com.evcharging.ev_charging_backend.model.Admin;
import com.evcharging.ev_charging_backend.model.Role;
import com.evcharging.ev_charging_backend.repository.AdminRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

        public static final String AUTHENTICATED_USER_ID = "authenticatedUserId";

        private final JwtUtils jwtUtils;
        private final CustomUserDetailsService userDetailsService;
        private final AdminRepository adminRepository;

        public JwtAuthenticationFilter(
                        JwtUtils jwtUtils,
                        CustomUserDetailsService userDetailsService,
                        AdminRepository adminRepository) {

                this.jwtUtils = jwtUtils;
                this.userDetailsService = userDetailsService;
                this.adminRepository = adminRepository;
        }

        @Override
        protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain)
                        throws ServletException, IOException {

                // Skip JWT processing for CORS preflight requests
                if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                        filterChain.doFilter(request, response);
                        return;
                }

                final String authHeader = request.getHeader("Authorization");

                // Public endpoints such as /api/admin/auth/login must remain
                // accessible without a JWT. If there is no Bearer token,
                // do not reject the request here.
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                        filterChain.doFilter(request, response);
                        return;
                }

                String username = null;
                String jwtToken = null;

                // Get token from Authorization header
                jwtToken = authHeader.substring(7);

                try {
                        username = jwtUtils.extractEmail(jwtToken);
                } catch (Exception e) {
                        logger.error(
                                        "Unable to extract JWT token: "
                                                        + e.getMessage());
                }

                // Continue only if token contains a username
                // and nobody is authenticated yet
                if (username != null
                                && SecurityContextHolder
                                                .getContext()
                                                .getAuthentication() == null) {

                        try {

                                // Read role from JWT
                                String role = jwtUtils.extractRole(jwtToken);
                                Role jwtRole = parseRole(role);
                                String userId = jwtUtils.extractUserId(jwtToken);

                                UserDetails userDetails;

                                /*
                                 * ================================
                                 * ADMIN AUTHENTICATION
                                 * ================================
                                 */
                                if (jwtRole == Role.ADMIN) {

                                        Admin admin = adminRepository
                                                        .findByEmail(username)
                                                        .orElse(null);

                                        if (admin == null) {
                                                logger.error(
                                                                "Admin not found: "
                                                                                + username);

                                                filterChain.doFilter(
                                                                request,
                                                                response);
                                                return;
                                        }

                                        /*
                                         * Create Spring Security user
                                         * with ROLE_ADMIN authority.
                                         */
                                        userDetails = new org.springframework.security.core.userdetails.User(
                                                        admin.getEmail(),
                                                        admin.getPassword(),
                                                        Collections.singletonList(
                                                                        new SimpleGrantedAuthority(
                                                                                        "ROLE_"
                                                                                                        + Role.ADMIN.name())));

                                }

                                /*
                                 * ================================
                                 * NORMAL USER AUTHENTICATION
                                 * ================================
                                 */
                                else {
                                        UserDetails databaseUser = userDetailsService.loadUserByUsername(username);
                                        userDetails = new org.springframework.security.core.userdetails.User(
                                                        databaseUser.getUsername(),
                                                        databaseUser.getPassword(),
                                                        databaseUser.getAuthorities());
                                }

                                /*
                                 * Validate JWT
                                 */
                                if (jwtUtils.validateToken(
                                                jwtToken,
                                                userDetails)) {

                                        if (userId != null && !userId.isBlank()) {
                                                request.setAttribute(AUTHENTICATED_USER_ID, userId);
                                        }

                                        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                                                        userDetails,
                                                        null,
                                                        userDetails.getAuthorities());

                                        authenticationToken.setDetails(
                                                        new WebAuthenticationDetailsSource()
                                                                        .buildDetails(request));

                                        SecurityContextHolder
                                                        .getContext()
                                                        .setAuthentication(
                                                                        authenticationToken);
                                        logger.info("REQUEST: " + request.getMethod() + " "
                                                        + request.getRequestURI() + " USER: " + username
                                                        + " JWT ROLE: " + jwtRole.name() + " AUTHORITIES: "
                                                        + userDetails.getAuthorities());
                                }

                        } catch (Exception e) {

                                logger.error(
                                                "Cannot set user authentication: "
                                                                + e.getMessage());
                        }
                }

                filterChain.doFilter(
                                request,
                                response);
        }

        private Role parseRole(String role) {
                if (role == null || role.isBlank()) {
                        throw new IllegalArgumentException("JWT role is missing");
                }
                String normalizedRole = role.toUpperCase();
                if (normalizedRole.startsWith("ROLE_")) {
                        normalizedRole = normalizedRole.substring("ROLE_".length());
                }
                return Role.valueOf(normalizedRole);
        }
}