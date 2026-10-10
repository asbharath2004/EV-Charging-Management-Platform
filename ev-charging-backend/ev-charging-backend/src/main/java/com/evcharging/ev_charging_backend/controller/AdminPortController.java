package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.AdminChargingPortResponse;
import com.evcharging.ev_charging_backend.dto.StationApprovalRequest;
import com.evcharging.ev_charging_backend.exception.ResourceNotFoundException;
import com.evcharging.ev_charging_backend.model.ApprovalStatus;
import com.evcharging.ev_charging_backend.model.ChargingPort;
import com.evcharging.ev_charging_backend.repository.ChargingPortRepository;
import com.evcharging.ev_charging_backend.repository.ChargingStationRepository;
import com.evcharging.ev_charging_backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/ports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPortController {
    private final ChargingPortRepository repository;
    private final ChargingStationRepository stationRepository;
    private final UserRepository userRepository;

    public AdminPortController(ChargingPortRepository repository, ChargingStationRepository stationRepository,
            UserRepository userRepository) {
        this.repository = repository;
        this.stationRepository = stationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/pending")
    public List<AdminChargingPortResponse> pending() {
        return repository.findByApprovalStatus(ApprovalStatus.PENDING).stream().map(this::toResponse).toList();
    }

    @GetMapping
    public List<AdminChargingPortResponse> all() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @PutMapping("/{id}/approval")
    public AdminChargingPortResponse approve(@PathVariable String id,
            @Valid @RequestBody StationApprovalRequest request) {
        ChargingPort port = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charging port not found with id: " + id));
        ApprovalStatus status;
        try {
            status = ApprovalStatus.valueOf(request.getApprovalStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid approval status. Use APPROVED or REJECTED.");
        }
        if (status == ApprovalStatus.PENDING) {
            throw new IllegalArgumentException("Admin cannot set port back to PENDING.");
        }
        port.setApprovalStatus(status);
        port.setRejectionReason(status == ApprovalStatus.REJECTED ? request.getRejectionReason() : null);
        return toResponse(repository.save(port));
    }

    private AdminChargingPortResponse toResponse(ChargingPort port) {
        var station = stationRepository.findById(port.getStationId()).orElse(null);
        var owner = station == null ? null : userRepository.findById(station.getOwnerId()).orElse(null);
        return new AdminChargingPortResponse(port.getId(), port.getStationId(),
                station == null ? null : station.getName(), station == null ? null : station.getAddress(),
                station == null ? null : station.getOwnerId(), owner == null ? null : owner.getName(),
                owner == null ? null : owner.getEmail(), port.getPortNumber(),
                port.getConnectorType(), port.getPowerKw(), port.getStatus(), port.getPricePerKwh(),
                port.getApprovalStatus(), port.getRejectionReason());
    }
}