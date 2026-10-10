package com.evcharging.ev_charging_backend.service;

import com.evcharging.ev_charging_backend.dto.AdminAuthResponse;
import com.evcharging.ev_charging_backend.dto.AdminResponse;
import com.evcharging.ev_charging_backend.model.Admin;
import com.evcharging.ev_charging_backend.repository.AdminRepository;
import com.evcharging.ev_charging_backend.security.JwtUtils;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AdminAuthService(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AdminAuthResponse login(String email, String password) {

        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid admin email or password"));

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new BadCredentialsException("Invalid admin email or password");
        }

        String token = jwtUtils.generateToken(
                admin.getEmail(),
                "ADMIN",
                admin.getId()
        );

        AdminResponse adminResponse = new AdminResponse(
                admin.getId(),
                admin.getName(),
                admin.getEmail()
        );

        return new AdminAuthResponse(token, adminResponse);
    }
}