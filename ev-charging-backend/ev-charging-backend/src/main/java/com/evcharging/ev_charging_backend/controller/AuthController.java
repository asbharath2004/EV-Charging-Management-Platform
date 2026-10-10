package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.AuthResponse;
import com.evcharging.ev_charging_backend.dto.LoginRequest;
import com.evcharging.ev_charging_backend.dto.RegisterRequest;
import com.evcharging.ev_charging_backend.dto.UserResponse;
import com.evcharging.ev_charging_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new org.springframework.security.authentication.BadCredentialsException("User is not authenticated");
        }
        String email = authentication.getName();
        return authService.getCurrentUser(email);
    }
}
