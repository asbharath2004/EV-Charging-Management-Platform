package com.evcharging.ev_charging_backend.service;

import com.evcharging.ev_charging_backend.dto.ChargingPortRequest;
import com.evcharging.ev_charging_backend.dto.ChargingPortResponse;
import com.evcharging.ev_charging_backend.exception.ResourceNotFoundException;
import com.evcharging.ev_charging_backend.model.ChargingPort;
import com.evcharging.ev_charging_backend.model.PortStatus;
import com.evcharging.ev_charging_backend.model.ApprovalStatus;
import com.evcharging.ev_charging_backend.model.ChargingStation;
import com.evcharging.ev_charging_backend.model.User;
import com.evcharging.ev_charging_backend.repository.ChargingPortRepository;
import com.evcharging.ev_charging_backend.repository.ChargingStationRepository;
import com.evcharging.ev_charging_backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChargingPortService {

        private final ChargingPortRepository chargingPortRepository;
        private final ChargingStationRepository chargingStationRepository;
        private final UserRepository userRepository;

        public ChargingPortService(
                        ChargingPortRepository chargingPortRepository,
                        ChargingStationRepository chargingStationRepository,
                        UserRepository userRepository) {

                this.chargingPortRepository = chargingPortRepository;
                this.chargingStationRepository = chargingStationRepository;
                this.userRepository = userRepository;
        }

        // =====================================================
        // CREATE PORT
        // =====================================================

        public ChargingPortResponse createPort(
                        ChargingPortRequest request,
                        Authentication authentication) {

                ChargingStation station = getManageableStation(request.getStationId(), authentication);

                ChargingPort port = new ChargingPort();

                port.setStationId(station.getId());

                port.setPortNumber(
                                request.getPortNumber());

                port.setConnectorType(
                                request.getConnectorType());

                port.setPowerKw(
                                request.getPowerKw());

                // New port is available by default
                port.setStatus(
                                PortStatus.AVAILABLE);

                port.setPricePerKwh(
                                request.getPricePerKwh());
                port.setApprovalStatus(ApprovalStatus.PENDING);
                port.setRejectionReason(null);

                ChargingPort savedPort = chargingPortRepository.save(port);

                return convertToResponse(
                                savedPort);
        }

        // =====================================================
        // GET ALL PORTS
        // =====================================================

        public List<ChargingPortResponse> getAllPorts(Authentication authentication) {

                return chargingPortRepository.findAll()
                                .stream()
                                .filter(port -> isAdmin(authentication) || isApproved(port))
                                .map(this::convertToResponse)
                                .toList();
        }

        // =====================================================
        // GET PORT BY ID
        // =====================================================

        public ChargingPortResponse getPortById(
                        String id,
                        Authentication authentication) {

                ChargingPort port = chargingPortRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging port not found with id: "
                                                                + id));

                if (!isAdmin(authentication) && !isApproved(port)) {
                        throw new AccessDeniedException("This charging port is not approved for public access.");
                }
                return convertToResponse(port);
        }

        // =====================================================
        // GET PORTS BY STATION
        // =====================================================

        public List<ChargingPortResponse> getPortsByStation(
                        String stationId,
                        Authentication authentication) {

                if (isHost(authentication)) {
                        getOwnedStation(stationId, authentication);
                }

                ChargingStation station = chargingStationRepository.findById(stationId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging station not found with id: " + stationId));
                boolean host = isHost(authentication);
                boolean admin = isAdmin(authentication);
                return chargingPortRepository
                                .findByStationId(stationId)
                                .stream()
                                .filter(port -> (host || admin)
                                                || (station.getApprovalStatus() == ApprovalStatus.APPROVED
                                                                && isApproved(port)))
                                .map(this::convertToResponse)
                                .toList();
        }

        // =====================================================
        // UPDATE PORT
        // =====================================================

        public ChargingPortResponse updatePort(
                        String id,
                        ChargingPortRequest request,
                        Authentication authentication) {

                ChargingPort existingPort = chargingPortRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging port not found with id: "
                                                                + id));

                ChargingStation station = getManageableStation(existingPort.getStationId(), authentication);
                if (!station.getId().equals(request.getStationId()) && !isAdmin(authentication)) {
                        throw new AccessDeniedException("A port cannot be moved to another station.");
                }
                existingPort.setStationId(request.getStationId());

                existingPort.setPortNumber(
                                request.getPortNumber());

                existingPort.setConnectorType(
                                request.getConnectorType());

                existingPort.setPowerKw(
                                request.getPowerKw());

                existingPort.setPricePerKwh(
                                request.getPricePerKwh());

                /*
                 * We intentionally do NOT update status here.
                 *
                 * Status is controlled by the charging system:
                 *
                 * AVAILABLE → charging starts → OCCUPIED
                 * OCCUPIED → charging ends → AVAILABLE
                 */

                ChargingPort updatedPort = chargingPortRepository.save(
                                existingPort);

                return convertToResponse(
                                updatedPort);
        }

        // =====================================================
        // DELETE PORT
        // =====================================================

        public void deletePort(
                        String id,
                        Authentication authentication) {

                if (!chargingPortRepository.existsById(id)) {

                        throw new ResourceNotFoundException(
                                        "Charging port not found with id: " + id);
                }

                ChargingPort port = chargingPortRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging port not found with id: " + id));
                getManageableStation(port.getStationId(), authentication);
                chargingPortRepository.deleteById(id);
        }

        private ChargingStation getManageableStation(String stationId, Authentication authentication) {
                ChargingStation station = getOwnedStation(stationId, authentication);
                if (isAdmin(authentication))
                        return station;
                if (station.getApprovalStatus() != ApprovalStatus.APPROVED) {
                        throw new IllegalArgumentException(
                                        "Charging ports can only be managed after station approval.");
                }
                return station;
        }

        private ChargingStation getOwnedStation(String stationId, Authentication authentication) {
                ChargingStation station = chargingStationRepository.findById(stationId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging station not found with id: " + stationId));
                if (isAdmin(authentication))
                        return station;
                User host = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                if (!host.getId().equals(station.getOwnerId())) {
                        throw new AccessDeniedException("You are not authorized to manage ports for this station.");
                }
                return station;
        }

        private boolean isHost(Authentication authentication) {
                return authentication != null && authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_STATION_HOST"));
        }

        private boolean isAdmin(Authentication authentication) {
                return authentication != null && authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        }

        private boolean isApproved(ChargingPort port) {
                return port.getApprovalStatus() == null
                                || port.getApprovalStatus() == ApprovalStatus.APPROVED;
        }

        // =====================================================
        // CONVERT ENTITY TO RESPONSE
        // =====================================================

        private ChargingPortResponse convertToResponse(
                        ChargingPort port) {

                return new ChargingPortResponse(
                                port.getId(),
                                port.getStationId(),
                                port.getPortNumber(),
                                port.getConnectorType(),
                                port.getPowerKw(),
                                port.getStatus(),
                                port.getPricePerKwh(),
                                port.getApprovalStatus(),
                                port.getRejectionReason());
        }
}