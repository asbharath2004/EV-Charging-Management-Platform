package com.evcharging.ev_charging_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtils {
        @Value("${jwt.secret}")
        private String jwtSecret;

        @Value("${jwt.expirationMs:86400000}")
        private long jwtExpirationMs;

        // =========================================================
        // Create Signing Key
        // =========================================================

        private SecretKey getSigningKey() {

                byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);

                return Keys.hmacShaKeyFor(keyBytes);
        }

        // =========================================================
        // Generate JWT Token
        // =========================================================

        public String generateToken(
                        String email,
                        String role,
                        String userId) {

                Map<String, Object> claims = new HashMap<>();

                claims.put("role", role);
                claims.put("userId", userId);

                return createToken(claims, email);
        }

        // =========================================================
        // Create Token
        // =========================================================

        private String createToken(
                        Map<String, Object> claims,
                        String subject) {

                return Jwts.builder()
                                .claims(claims)
                                .subject(subject)
                                .issuedAt(
                                                new Date(System.currentTimeMillis()))
                                .expiration(
                                                new Date(
                                                                System.currentTimeMillis()
                                                                                + jwtExpirationMs))
                                .signWith(getSigningKey())
                                .compact();
        }

        // =========================================================
        // Extract Email
        // =========================================================

        public String extractEmail(String token) {

                return extractClaim(
                                token,
                                Claims::getSubject);
        }

        // =========================================================
        // Extract Role
        // =========================================================

        public String extractRole(String token) {

                return extractClaim(
                                token,
                                claims -> claims.get("role", String.class));
        }

        public String extractUserId(String token) {
                return extractClaim(
                                token,
                                claims -> claims.get("userId", String.class));
        }

        // =========================================================
        // Extract Expiration
        // =========================================================

        public Date extractExpiration(String token) {

                return extractClaim(
                                token,
                                Claims::getExpiration);
        }

        // =========================================================
        // Extract Any Claim
        // =========================================================

        public <T> T extractClaim(
                        String token,
                        Function<Claims, T> claimsResolver) {

                final Claims claims = extractAllClaims(token);

                return claimsResolver.apply(claims);
        }

        // =========================================================
        // Extract All Claims
        // =========================================================

        private Claims extractAllClaims(String token) {

                return Jwts.parser()
                                .verifyWith(getSigningKey())
                                .build()
                                .parseSignedClaims(token)
                                .getPayload();
        }

        // =========================================================
        // Check Token Expiration
        // =========================================================

        private Boolean isTokenExpired(String token) {

                return extractExpiration(token)
                                .before(new Date());
        }

        // =========================================================
        // Validate Token
        // =========================================================

        public Boolean validateToken(
                        String token,
                        UserDetails userDetails) {

                final String email = extractEmail(token);

                return (email.equalsIgnoreCase(
                                userDetails.getUsername())
                                && !isTokenExpired(token));
        }
}