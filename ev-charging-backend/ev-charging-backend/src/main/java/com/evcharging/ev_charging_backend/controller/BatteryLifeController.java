package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.BatteryLifeResponse;
import com.evcharging.ev_charging_backend.service.BatteryLifeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/battery-life")
public class BatteryLifeController {

    private final BatteryLifeService batteryLifeService;

    public BatteryLifeController(BatteryLifeService batteryLifeService) {
        this.batteryLifeService = batteryLifeService;
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BatteryLifeResponse> getBatteryLifeForUser(
            @PathVariable String userId,
            Authentication authentication) {
        return ResponseEntity.ok(batteryLifeService.getUserBatteryLife(userId, authentication));
    }
}
