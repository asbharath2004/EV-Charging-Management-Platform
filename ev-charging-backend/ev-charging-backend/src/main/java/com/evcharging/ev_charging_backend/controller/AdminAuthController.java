package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.AdminAuthResponse;
import com.evcharging.ev_charging_backend.dto.AdminLoginRequest;
import com.evcharging.ev_charging_backend.service.AdminAuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public AdminAuthResponse login(
            @Valid @RequestBody AdminLoginRequest request) {

        return adminAuthService.login(
                request.getEmail(),
                request.getPassword()
        );
    }
}