package com.evcharging.ev_charging_backend.config;

import com.evcharging.ev_charging_backend.model.Admin;
import com.evcharging.ev_charging_backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.initial.name:}")
    private String adminName;

    @Value("${admin.initial.email:}")
    private String adminEmail;

    @Value("${admin.initial.password:}")
    private String adminPassword;

    public AdminDataInitializer(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminName.isBlank() || adminEmail.isBlank() || adminPassword.isBlank()) {
            System.out.println("Initial admin creation skipped because admin environment settings are incomplete.");
            return;
        }

        if (adminRepository.existsByEmail(adminEmail)) {
            System.out.println("Initial admin account already exists.");
            return;
        }

        Admin admin = new Admin(
                adminName,
                adminEmail,
                passwordEncoder.encode(adminPassword));
        adminRepository.save(admin);
        System.out.println("Initial admin account created.");
    }
}
