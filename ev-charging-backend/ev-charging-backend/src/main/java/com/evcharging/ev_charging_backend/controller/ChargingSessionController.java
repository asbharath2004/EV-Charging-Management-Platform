package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.ChargingSessionEndRequest;
import com.evcharging.ev_charging_backend.dto.ChargingSessionRequest;
import com.evcharging.ev_charging_backend.dto.ChargingSessionResponse;
import com.evcharging.ev_charging_backend.service.ChargingSessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/sessions")
public class ChargingSessionController {

    private final ChargingSessionService chargingSessionService;

    public ChargingSessionController(
            ChargingSessionService chargingSessionService) {

        this.chargingSessionService = chargingSessionService;
    }

    // =====================================================
    // START CHARGING SESSION
    // =====================================================

    @PostMapping("/start")
    @PreAuthorize("hasRole('USER')")
    @ResponseStatus(HttpStatus.CREATED)
    public ChargingSessionResponse startSession(
            @Valid @RequestBody ChargingSessionRequest request) {

        return chargingSessionService.startSession(
                request);
    }

    // =====================================================
    // END CHARGING SESSION
    // =====================================================

    @PutMapping("/{id}/end")
    @PreAuthorize("hasRole('STATION_HOST')")
    public ChargingSessionResponse endSession(
            @PathVariable String id,
            @Valid @RequestBody ChargingSessionEndRequest request,
            Authentication authentication) {

        return chargingSessionService.endSessionAsHost(id, request, authentication.getName());
    }

    @PostMapping("/{id}/request-end")
    @PreAuthorize("hasRole('USER')")
    public ChargingSessionResponse requestEnd(@PathVariable String id, Authentication authentication) {
        return chargingSessionService.requestEnd(id, authentication.getName());
    }

    @GetMapping("/host")
    @PreAuthorize("hasAnyRole('STATION_HOST', 'ADMIN')")
    public List<ChargingSessionResponse> getHostSessions(Authentication authentication) {
        return chargingSessionService.getHostSessions(authentication.getName());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<ChargingSessionResponse> getUserSessions(@PathVariable String userId, Authentication authentication) {
        return chargingSessionService.getUserSessions(userId, authentication.getName());
    }

    @GetMapping("/fleet")
    @PreAuthorize("hasAnyRole('FLEET_OPERATOR', 'ADMIN')")
    public List<ChargingSessionResponse> getFleetSessions(Authentication authentication) {
        return chargingSessionService.getSessionsForRole(authentication);
    }

    // =====================================================
    // GET ALL SESSIONS
    // =====================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ChargingSessionResponse> getAllSessions(Authentication authentication) {

        return chargingSessionService.getSessionsForRole(authentication);
    }

    // =====================================================
    // GET SESSION BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ChargingSessionResponse getSessionById(
            @PathVariable String id,
            Authentication authentication) {

        return chargingSessionService.getSessionById(
                id, authentication);
    }
}