package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.ChargingStationResponse;
import com.evcharging.ev_charging_backend.dto.StationApprovalRequest;
import com.evcharging.ev_charging_backend.model.ApprovalStatus;
import com.evcharging.ev_charging_backend.model.ChargingStation;
import com.evcharging.ev_charging_backend.repository.ChargingStationRepository;
import com.evcharging.ev_charging_backend.exception.ResourceNotFoundException;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/stations")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStationController {

        private final ChargingStationRepository chargingStationRepository;

        public AdminStationController(
                        ChargingStationRepository chargingStationRepository) {

                this.chargingStationRepository = chargingStationRepository;
        }

        @GetMapping("/pending")
        public List<ChargingStationResponse> getPendingStations() {

                return chargingStationRepository
                                .findByApprovalStatus(ApprovalStatus.PENDING)
                                .stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        @GetMapping
        public List<ChargingStationResponse> getAllStations() {

                return chargingStationRepository.findAll()
                                .stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        @PutMapping("/{id}/approval")
        public ChargingStationResponse updateApproval(
                        @PathVariable String id,
                        @Valid @RequestBody StationApprovalRequest request) {

                ChargingStation station = chargingStationRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging station not found with id: "
                                                                + id));

                ApprovalStatus approvalStatus;

                try {
                        approvalStatus = ApprovalStatus.valueOf(
                                        request.getApprovalStatus()
                                                        .toUpperCase());
                } catch (IllegalArgumentException e) {
                        throw new IllegalArgumentException(
                                        "Invalid approval status. Use APPROVED or REJECTED.");
                }

                if (approvalStatus == ApprovalStatus.PENDING) {
                        throw new IllegalArgumentException(
                                        "Admin cannot set station back to PENDING.");
                }

                station.setApprovalStatus(approvalStatus);

                if (approvalStatus == ApprovalStatus.APPROVED) {

                        station.setRejectionReason(null);

                } else if (approvalStatus == ApprovalStatus.REJECTED) {

                        station.setRejectionReason(
                                        request.getRejectionReason());
                }

                ChargingStation updatedStation = chargingStationRepository.save(station);

                return convertToResponse(updatedStation);
        }

        private ChargingStationResponse convertToResponse(
                        ChargingStation station) {

                return new ChargingStationResponse(
                                station.getId(),
                                station.getName(),
                                station.getAddress(),
                                station.getLatitude(),
                                station.getLongitude(),
                                station.getStatus(),
                                station.getApprovalStatus(),
                                station.getRejectionReason(),
                                station.getOwnerId());
        }
}