package com.evcharging.ev_charging_backend.service;

import com.evcharging.ev_charging_backend.dto.ChargingStationRequest;
import com.evcharging.ev_charging_backend.dto.ChargingStationResponse;
import com.evcharging.ev_charging_backend.exception.ResourceNotFoundException;
import com.evcharging.ev_charging_backend.model.ApprovalStatus;
import com.evcharging.ev_charging_backend.model.ChargingStation;
import com.evcharging.ev_charging_backend.model.StationStatus;
import com.evcharging.ev_charging_backend.model.User;
import com.evcharging.ev_charging_backend.repository.ChargingStationRepository;
import com.evcharging.ev_charging_backend.repository.UserRepository;
import com.evcharging.ev_charging_backend.exception.DuplicateResourceException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChargingStationService {

        private final ChargingStationRepository chargingStationRepository;
        private final UserRepository userRepository;

        public ChargingStationService(
                        ChargingStationRepository chargingStationRepository,
                        UserRepository userRepository) {

                this.chargingStationRepository = chargingStationRepository;

                this.userRepository = userRepository;
        }

        // =========================================================
        // CREATE STATION
        // =========================================================

        public ChargingStationResponse createStation(
                        ChargingStationRequest request,
                        String userEmail) {

                // Find the currently logged-in user
                User owner = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with email: "
                                                                + userEmail));

                if (owner.getRole() == com.evcharging.ev_charging_backend.model.Role.STATION_HOST
                                && chargingStationRepository.findFirstByOwnerId(owner.getId()).isPresent()) {
                        throw new DuplicateResourceException("Station Host can have only one charging station.");
                }

                ChargingStation station = new ChargingStation();

                station.setName(request.getName());
                station.setAddress(request.getAddress());
                station.setLatitude(request.getLatitude());
                station.setLongitude(request.getLongitude());

                // Station status
                station.setStatus(StationStatus.AVAILABLE);

                // New station always requires admin approval
                station.setApprovalStatus(
                                ApprovalStatus.PENDING);

                // Store the logged-in user's ID
                station.setOwnerId(
                                owner.getId());

                // No rejection reason when first created
                station.setRejectionReason(null);

                ChargingStation savedStation = chargingStationRepository.save(station);

                return convertToResponse(savedStation);
        }

        // =========================================================
        // GET APPROVED STATIONS
        // =========================================================

        public List<ChargingStationResponse> getAllStations() {

                return chargingStationRepository
                                .findByApprovalStatus(
                                                ApprovalStatus.APPROVED)
                                .stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        public List<ChargingStationResponse> getStationsByApprovalStatus(ApprovalStatus approvalStatus) {
                return chargingStationRepository.findByApprovalStatus(approvalStatus)
                                .stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        // =========================================================
        // GET STATION BY ID
        // =========================================================

        public ChargingStationResponse getStationById(
                        String id,
                        Authentication authentication) {

                ChargingStation station = chargingStationRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging station not found with id: "
                                                                + id));

                if (authentication != null && authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_STATION_HOST"))) {
                        User host = userRepository.findByEmail(authentication.getName())
                                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                        if (!host.getId().equals(station.getOwnerId())) {
                                throw new AccessDeniedException("You are not authorized to access this station.");
                        }
                } else if (!isAdmin(authentication) && station.getApprovalStatus() != ApprovalStatus.APPROVED) {
                        throw new ResourceNotFoundException("Charging station not found with id: " + id);
                }
                return convertToResponse(station);
        }

        private boolean isAdmin(Authentication authentication) {
                return authentication != null && authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        }

        public ChargingStationResponse getMyStation(String authenticatedUserId, String userEmail) {
                User host = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                if (host.getRole() != com.evcharging.ev_charging_backend.model.Role.STATION_HOST) {
                        throw new AccessDeniedException("Only Station Hosts can access their station.");
                }
                String ownerId = authenticatedUserId != null && !authenticatedUserId.isBlank()
                                ? authenticatedUserId
                                : host.getId();
                if (!host.getId().equals(ownerId)) {
                        throw new AccessDeniedException("Authenticated user ID does not match the logged-in user.");
                }
                ChargingStation station = chargingStationRepository.findFirstByOwnerId(ownerId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "No charging station found for this Station Host."));
                return convertToResponse(station);
        }

        // =========================================================
        // UPDATE STATION
        // =========================================================

        public ChargingStationResponse updateStation(
                        String id,
                        ChargingStationRequest request,
                        Authentication authentication) {

                ChargingStation existingStation = chargingStationRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging station not found with id: "
                                                                + id));

                ensureStationAccess(existingStation, authentication);
                existingStation.setName(request.getName());
                existingStation.setAddress(request.getAddress());
                existingStation.setLatitude(request.getLatitude());
                existingStation.setLongitude(request.getLongitude());

                ChargingStation updatedStation = chargingStationRepository.save(
                                existingStation);

                return convertToResponse(updatedStation);
        }

        // =========================================================
        // DELETE STATION
        // =========================================================

        public void deleteStation(String id, Authentication authentication) {

                if (!chargingStationRepository.existsById(id)) {

                        throw new ResourceNotFoundException(
                                        "Charging station not found with id: "
                                                        + id);
                }

                ChargingStation station = chargingStationRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging station not found with id: " + id));
                ensureStationAccess(station, authentication);
                chargingStationRepository.deleteById(id);
        }

        private void ensureStationAccess(ChargingStation station, Authentication authentication) {
                boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
                if (isAdmin)
                        return;
                User user = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                if (!user.getId().equals(station.getOwnerId())) {
                        throw new AccessDeniedException("You are not authorized to manage this station.");
                }
        }

        // =========================================================
        // CONVERT TO RESPONSE
        // =========================================================

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