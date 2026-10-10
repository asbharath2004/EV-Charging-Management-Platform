package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.ChargingStationRequest;
import com.evcharging.ev_charging_backend.dto.ChargingStationResponse;
import com.evcharging.ev_charging_backend.service.ChargingStationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import com.evcharging.ev_charging_backend.security.JwtAuthenticationFilter;

@RestController
@RequestMapping("/api/stations")
public class ChargingStationController {

    private final ChargingStationService chargingStationService;

    public ChargingStationController(
            ChargingStationService chargingStationService) {

        this.chargingStationService = chargingStationService;
    }

    // =========================================================
    // CREATE STATION
    // Only Station Host can create a station
    // =========================================================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('STATION_HOST')")
    public ChargingStationResponse createStation(
            @Valid @RequestBody ChargingStationRequest request,
            Principal principal) {

        return chargingStationService.createStation(
                request,
                principal.getName());
    }

    // =========================================================
    // GET APPROVED STATIONS
    // =========================================================

    @GetMapping
    public List<ChargingStationResponse> getAllStations() {

        return chargingStationService.getAllStations();
    }

    @GetMapping("/my-station")
    @PreAuthorize("hasRole('STATION_HOST')")
    public ChargingStationResponse getMyStation(
            Principal principal,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute(JwtAuthenticationFilter.AUTHENTICATED_USER_ID);
        return chargingStationService.getMyStation(userId, principal.getName());
    }

    // =========================================================
    // GET STATION BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ChargingStationResponse getStationById(
            @PathVariable String id,
            Authentication authentication) {

        return chargingStationService.getStationById(id, authentication);
    }

    // =========================================================
    // UPDATE STATION
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STATION_HOST', 'ADMIN')")
    public ChargingStationResponse updateStation(
            @PathVariable String id,
            @Valid @RequestBody ChargingStationRequest request,
            Authentication authentication) {

        return chargingStationService.updateStation(
                id,
                request,
                authentication);
    }

    // =========================================================
    // DELETE STATION
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STATION_HOST', 'ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStation(
            @PathVariable String id,
            Authentication authentication) {

        chargingStationService.deleteStation(id, authentication);
    }
}