package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.ChargingPortRequest;
import com.evcharging.ev_charging_backend.dto.ChargingPortResponse;
import com.evcharging.ev_charging_backend.service.ChargingPortService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ports")
public class ChargingPortController {

    private final ChargingPortService chargingPortService;

    public ChargingPortController(
            ChargingPortService chargingPortService) {

        this.chargingPortService = chargingPortService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STATION_HOST', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ChargingPortResponse createPort(
            @Valid @RequestBody ChargingPortRequest request,
            Authentication authentication) {

        return chargingPortService.createPort(request, authentication);
    }

    @GetMapping
    public List<ChargingPortResponse> getAllPorts(Authentication authentication) {
        return chargingPortService.getAllPorts(authentication);
    }

    @GetMapping("/{id}")
    public ChargingPortResponse getPortById(
            @PathVariable String id,
            Authentication authentication) {

        return chargingPortService.getPortById(id, authentication);
    }

    @GetMapping("/station/{stationId}")
    public List<ChargingPortResponse> getPortsByStation(
            @PathVariable String stationId,
            Authentication authentication) {

        return chargingPortService.getPortsByStation(
                stationId,
                authentication);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STATION_HOST', 'ADMIN')")
    public ChargingPortResponse updatePort(
            @PathVariable String id,
            @Valid @RequestBody ChargingPortRequest request,
            Authentication authentication) {

        return chargingPortService.updatePort(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STATION_HOST', 'ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePort(@PathVariable String id, Authentication authentication) {

        chargingPortService.deletePort(id, authentication);
    }
}