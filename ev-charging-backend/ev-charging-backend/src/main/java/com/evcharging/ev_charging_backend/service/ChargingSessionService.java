package com.evcharging.ev_charging_backend.service;

import com.evcharging.ev_charging_backend.dto.ChargingSessionEndRequest;
import com.evcharging.ev_charging_backend.dto.ChargingSessionRequest;
import com.evcharging.ev_charging_backend.dto.ChargingSessionResponse;
import com.evcharging.ev_charging_backend.exception.ResourceNotFoundException;
import com.evcharging.ev_charging_backend.model.Booking;
import com.evcharging.ev_charging_backend.model.BookingStatus;
import com.evcharging.ev_charging_backend.model.ChargingPort;
import com.evcharging.ev_charging_backend.model.ChargingSession;
import com.evcharging.ev_charging_backend.model.ChargingSessionStatus;
import com.evcharging.ev_charging_backend.model.PortStatus;
import com.evcharging.ev_charging_backend.model.User;
import com.evcharging.ev_charging_backend.model.PaymentStatus;
import com.evcharging.ev_charging_backend.repository.BookingRepository;
import com.evcharging.ev_charging_backend.repository.ChargingPortRepository;
import com.evcharging.ev_charging_backend.repository.ChargingSessionRepository;
import com.evcharging.ev_charging_backend.repository.ChargingStationRepository;
import com.evcharging.ev_charging_backend.repository.UserRepository;
import com.evcharging.ev_charging_backend.repository.VehicleRepository;
import com.evcharging.ev_charging_backend.repository.PaymentRepository;
import com.evcharging.ev_charging_backend.model.ChargingStation;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ChargingSessionService {

        private final ChargingSessionRepository chargingSessionRepository;
        private final BookingRepository bookingRepository;
        private final ChargingPortRepository chargingPortRepository;
        private final ChargingStationRepository chargingStationRepository;
        private final UserRepository userRepository;
        private final VehicleRepository vehicleRepository;
        private final PaymentRepository paymentRepository;

        public ChargingSessionService(
                        ChargingSessionRepository chargingSessionRepository,
                        BookingRepository bookingRepository,
                        ChargingPortRepository chargingPortRepository,
                        ChargingStationRepository chargingStationRepository,
                        UserRepository userRepository,
                        VehicleRepository vehicleRepository,
                        PaymentRepository paymentRepository) {

                this.chargingSessionRepository = chargingSessionRepository;

                this.bookingRepository = bookingRepository;

                this.chargingPortRepository = chargingPortRepository;
                this.chargingStationRepository = chargingStationRepository;
                this.userRepository = userRepository;
                this.vehicleRepository = vehicleRepository;
                this.paymentRepository = paymentRepository;
        }

        // =====================================================
        // START CHARGING SESSION
        // =====================================================

        public ChargingSessionResponse startSession(
                        ChargingSessionRequest request) {

                // 1. Find booking
                Booking booking = bookingRepository.findById(
                                request.getBookingId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Booking not found with id: "
                                                                                + request.getBookingId()));

                // 2. Check booking status
                if (booking.getStatus() != BookingStatus.CONFIRMED) {

                        throw new IllegalArgumentException(
                                        "Only confirmed bookings can start a charging session");
                }

                // 3. Find charging port
                ChargingPort port = chargingPortRepository.findById(
                                booking.getPortId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Charging port not found with id: "
                                                                                + booking.getPortId()));

                // 4. Check port availability
                if (port.getStatus() != PortStatus.AVAILABLE) {

                        throw new IllegalArgumentException(
                                        "Charging port is not available");
                }

                // 5. Create charging session
                ChargingSession session = new ChargingSession(
                                booking.getId(),
                                booking.getUserId(),
                                booking.getVehicleId(),
                                booking.getStationId(),
                                booking.getPortId(),
                                LocalDateTime.now(),
                                ChargingSessionStatus.IN_PROGRESS);

                // 6. Change port status
                port.setStatus(
                                PortStatus.OCCUPIED);

                // 7. Save port
                chargingPortRepository.save(
                                port);

                // 8. Save session
                ChargingSession savedSession = chargingSessionRepository.save(
                                session);

                // 9. Change booking status
                booking.setStatus(
                                BookingStatus.COMPLETED);

                /*
                 * We are NOT changing booking to COMPLETED here
                 * in a real-world flow.
                 *
                 * The booking should remain CONFIRMED while
                 * charging is happening.
                 *
                 * So we leave it CONFIRMED for now.
                 */

                // 10. Return response
                return convertToResponse(
                                savedSession);
        }

        // =====================================================
        // END CHARGING SESSION
        // =====================================================

        public ChargingSessionResponse endSession(
                        String sessionId,
                        ChargingSessionEndRequest request) {

                // 1. Find charging session
                ChargingSession session = chargingSessionRepository.findById(sessionId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging session not found with id: "
                                                                + sessionId));

                // 2. Check session status
                if (session.getStatus() != ChargingSessionStatus.END_REQUESTED
                                && session.getStatus() != ChargingSessionStatus.IN_PROGRESS) {

                        throw new IllegalArgumentException(
                                        "Charging session is not active");
                }

                // 3. Find charging port
                ChargingPort port = chargingPortRepository.findById(
                                session.getPortId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Charging port not found with id: "
                                                                                + session.getPortId()));

                // 4. Get energy consumed
                Double energyConsumed = request.getEnergyConsumedKwh();

                // 5. Get price per kWh
                Double pricePerKwh = port.getPricePerKwh();

                // 6. Calculate cost
                Double cost = energyConsumed * pricePerKwh;

                // 7. Update charging session
                session.setActualEndTime(
                                LocalDateTime.now());

                session.setEnergyConsumedKwh(
                                energyConsumed);

                session.setCost(cost);

                session.setStatus(
                                ChargingSessionStatus.COMPLETED);

                // 8. Make charging port available
                port.setStatus(
                                PortStatus.AVAILABLE);

                chargingPortRepository.save(port);

                // 9. Find related booking
                Booking booking = bookingRepository.findById(
                                session.getBookingId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Booking not found with id: "
                                                                                + session.getBookingId()));

                // 10. Complete the booking
                booking.setStatus(
                                BookingStatus.COMPLETED);

                bookingRepository.save(booking);

                // 11. Save completed session
                ChargingSession completedSession = chargingSessionRepository.save(session);

                // 12. Return response
                return convertToResponse(
                                completedSession);
        }

        public ChargingSessionResponse requestEnd(String sessionId, String userEmail) {
                ChargingSession session = chargingSessionRepository.findById(sessionId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging session not found with id: " + sessionId));
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                if (!user.getId().equals(session.getUserId())) {
                        throw new AccessDeniedException(
                                        "You are not authorized to request this charging session to end.");
                }
                if (session.getStatus() != ChargingSessionStatus.IN_PROGRESS) {
                        throw new IllegalArgumentException(
                                        "Your end-session request has already been sent or the session is completed.");
                }
                session.setStatus(ChargingSessionStatus.END_REQUESTED);
                return convertToResponse(chargingSessionRepository.save(session));
        }

        public ChargingSessionResponse endSessionAsHost(String sessionId, ChargingSessionEndRequest request,
                        String hostEmail) {
                ChargingSession session = chargingSessionRepository.findById(sessionId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging session not found with id: " + sessionId));
                User host = userRepository.findByEmail(hostEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                ChargingStation station = chargingStationRepository.findById(session.getStationId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging station not found with id: " + session.getStationId()));
                if (!host.getId().equals(station.getOwnerId())) {
                        throw new AccessDeniedException("You are not authorized to end this charging session.");
                }
                ChargingPort port = chargingPortRepository.findById(session.getPortId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Charging port not found with id: " + session.getPortId()));
                if (!station.getId().equals(port.getStationId())) {
                        throw new AccessDeniedException("You are not authorized to end this charging session.");
                }
                return endSession(sessionId, request);
        }

        public List<ChargingSessionResponse> getHostSessions(String hostEmail) {
                User host = userRepository.findByEmail(hostEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                return chargingStationRepository.findByOwnerId(host.getId()).stream()
                                .flatMap(station -> chargingSessionRepository.findByStationId(station.getId()).stream())
                                .map(this::convertToResponse)
                                .toList();
        }

        public List<ChargingSessionResponse> getUserSessions(String userId, String userEmail) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                if (!user.getId().equals(userId)) {
                        throw new AccessDeniedException("You are not authorized to view these charging sessions.");
                }
                return chargingSessionRepository.findByUserId(userId).stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        // =====================================================
        // GET SESSION BY ID
        // =====================================================

        public ChargingSessionResponse getSessionById(
                        String id,
                        Authentication authentication) {

                ChargingSession session = chargingSessionRepository.findById(
                                id).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Charging session not found with id: "
                                                                                + id));

                ensureSessionAccess(session, authentication);

                return convertToResponse(
                                session);
        }

        // =====================================================
        // GET ALL SESSIONS
        // =====================================================

        public List<ChargingSessionResponse> getAllSessions() {

                return chargingSessionRepository.findAll()
                                .stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        public List<ChargingSessionResponse> getSessionsForRole(Authentication authentication) {
                boolean isAdmin = authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
                if (isAdmin) {
                        return getAllSessions();
                }

                User operator = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                Set<String> fleetVehicleIds = vehicleRepository.findByUserId(operator.getId()).stream()
                                .map(vehicle -> vehicle.getId())
                                .collect(Collectors.toSet());
                return chargingSessionRepository.findAll().stream()
                                .filter(session -> fleetVehicleIds.contains(session.getVehicleId()))
                                .map(this::convertToResponse)
                                .toList();
        }

        private void ensureSessionAccess(ChargingSession session, Authentication authentication) {
                boolean admin = authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
                if (admin) {
                        return;
                }
                User user = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
                boolean owner = user.getId().equals(session.getUserId());
                boolean host = authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_STATION_HOST"));
                boolean ownsStation = chargingStationRepository.findByOwnerId(user.getId()).stream()
                                .anyMatch(station -> station.getId().equals(session.getStationId()));
                boolean fleet = authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_FLEET_OPERATOR"));
                boolean ownsVehicle = fleet && vehicleRepository.findByUserId(user.getId()).stream()
                                .anyMatch(vehicle -> vehicle.getId().equals(session.getVehicleId()));
                if (!owner && !(host && ownsStation) && !ownsVehicle) {
                        throw new AccessDeniedException("You are not authorized to view this charging session.");
                }
        }

        // =====================================================
        // CONVERT ENTITY TO RESPONSE
        // =====================================================

        private ChargingSessionResponse convertToResponse(
                        ChargingSession session) {

                return new ChargingSessionResponse(
                                session.getId(),
                                session.getBookingId(),
                                session.getUserId(),
                                session.getVehicleId(),
                                session.getStationId(),
                                session.getPortId(),
                                session.getActualStartTime(),
                                session.getActualEndTime(),
                                session.getEnergyConsumedKwh(),
                                session.getCost(),
                                session.getStatus(),
                                paymentRepository.findByChargingSessionId(session.getId())
                                                .map(payment -> payment.getStatus())
                                                .orElse(PaymentStatus.PENDING),
                                session.getCreatedAt());
        }
}