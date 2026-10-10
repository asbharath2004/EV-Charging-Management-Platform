package com.evcharging.ev_charging_backend.service;

import com.evcharging.ev_charging_backend.dto.PaymentRequest;
import com.evcharging.ev_charging_backend.dto.PaymentResponse;
import com.evcharging.ev_charging_backend.exception.ResourceNotFoundException;
import com.evcharging.ev_charging_backend.model.ChargingSession;
import com.evcharging.ev_charging_backend.model.ChargingSessionStatus;
import com.evcharging.ev_charging_backend.model.ChargingStation;
import com.evcharging.ev_charging_backend.model.Role;
import com.evcharging.ev_charging_backend.model.Payment;
import com.evcharging.ev_charging_backend.model.PaymentStatus;
import com.evcharging.ev_charging_backend.model.User;
import com.evcharging.ev_charging_backend.repository.ChargingStationRepository;
import com.evcharging.ev_charging_backend.repository.ChargingSessionRepository;
import com.evcharging.ev_charging_backend.repository.PaymentRepository;
import com.evcharging.ev_charging_backend.repository.UserRepository;
import com.evcharging.ev_charging_backend.repository.VehicleRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

        private final PaymentRepository paymentRepository;
        private final ChargingSessionRepository chargingSessionRepository;
        private final ChargingStationRepository chargingStationRepository;
        private final UserRepository userRepository;
        private final VehicleRepository vehicleRepository;

        public PaymentService(
                        PaymentRepository paymentRepository,
                        ChargingSessionRepository chargingSessionRepository,
                        ChargingStationRepository chargingStationRepository,
                        UserRepository userRepository,
                        VehicleRepository vehicleRepository) {

                this.paymentRepository = paymentRepository;
                this.chargingSessionRepository = chargingSessionRepository;
                this.chargingStationRepository = chargingStationRepository;
                this.userRepository = userRepository;
                this.vehicleRepository = vehicleRepository;
        }

        // =====================================================
        // CREATE PAYMENT
        // =====================================================

        public PaymentResponse createPayment(
                        PaymentRequest request,
                        org.springframework.security.core.Authentication authentication) {

                // 1. Find charging session
                ChargingSession session = chargingSessionRepository.findById(
                                request.getChargingSessionId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Charging session not found with id: "
                                                                                + request.getChargingSessionId()));

                // 2. Check session is completed
                if (session.getStatus() != ChargingSessionStatus.COMPLETED) {

                        throw new IllegalArgumentException(
                                        "Payment can only be made for a completed charging session");
                }

                User user = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
                if (!user.getId().equals(session.getUserId())) {
                        throw new AccessDeniedException("You are not authorized to pay for this charging session.");
                }

                // 3. Check if payment already exists
                if (paymentRepository
                                .findByChargingSessionId(
                                                session.getId())
                                .isPresent()) {

                        throw new IllegalArgumentException(
                                        "Payment already exists for this charging session");
                }

                // 4. Get amount from charging session
                Double amount = session.getCost();

                if (amount == null) {

                        throw new IllegalArgumentException(
                                        "Charging session cost is not available");
                }

                // 5. Generate transaction ID
                String transactionId = "TXN-" + UUID.randomUUID();

                // 6. Create payment
                Payment payment = new Payment(
                                session.getUserId(),
                                session.getId(),
                                amount,
                                PaymentStatus.SUCCESS,
                                request.getPaymentMethod(),
                                transactionId);

                // 7. Save payment
                Payment savedPayment = paymentRepository.save(payment);

                // 8. Return response
                return convertToResponse(savedPayment);
        }

        // =====================================================
        // GET PAYMENT BY ID
        // =====================================================

        public PaymentResponse getPaymentById(
                        String id) {

                Payment payment = paymentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Payment not found with id: "
                                                                + id));

                return convertToResponse(payment);
        }

        // =====================================================
        // GET ALL PAYMENTS
        // =====================================================

        public List<PaymentResponse> getAllPayments() {

                return paymentRepository.findAll()
                                .stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        public List<PaymentResponse> getPaymentsForRole(
                        org.springframework.security.core.Authentication authentication) {
                boolean isAdmin = authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
                if (isAdmin) {
                        return getAllPayments();
                }
                return userRepository.findByEmail(authentication.getName())
                                .map(user -> getPaymentsByUser(user.getId()))
                                .orElse(List.of());
        }

        public void validateUserAccess(String userId, Authentication authentication) {
                boolean isAdmin = authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
                if (isAdmin) {
                        return;
                }

                User authenticatedUser = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
                if (!authenticatedUser.getId().equals(userId)) {
                        throw new AccessDeniedException("You are not authorized to view these payments.");
                }
        }

        public List<PaymentResponse> getPaymentsForHost(
                        org.springframework.security.core.Authentication authentication) {

                User host = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (host.getRole() != Role.STATION_HOST) {
                        throw new AccessDeniedException("Only Station Hosts can access station revenue.");
                }

                ChargingStation station = chargingStationRepository.findFirstByOwnerId(host.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "No charging station found for this Station Host."));

                return chargingSessionRepository.findByStationId(station.getId())
                                .stream()
                                .filter(session -> session.getStatus() == ChargingSessionStatus.COMPLETED)
                                .map(ChargingSession::getId)
                                .flatMap(sessionId -> paymentRepository.findByChargingSessionId(sessionId).stream())
                                .map(this::convertToResponse)
                                .toList();
        }

        public List<PaymentResponse> getPaymentsForFleet(Authentication authentication) {
                boolean isAdmin = authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
                if (isAdmin) {
                        return getAllPayments();
                }

                User operator = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
                if (operator.getRole() != Role.FLEET_OPERATOR) {
                        throw new AccessDeniedException("Only Fleet Operators can access fleet payments.");
                }

                Set<String> fleetVehicleIds = vehicleRepository.findByUserId(operator.getId()).stream()
                                .map(vehicle -> vehicle.getId())
                                .collect(Collectors.toSet());

                if (fleetVehicleIds.isEmpty()) {
                        return List.of();
                }

                return chargingSessionRepository.findAll().stream()
                                .filter(session -> fleetVehicleIds.contains(session.getVehicleId()))
                                .map(ChargingSession::getId)
                                .flatMap(sessionId -> paymentRepository.findByChargingSessionId(sessionId).stream())
                                .map(this::convertToResponse)
                                .toList();
        }

        // =====================================================
        // GET PAYMENTS BY USER
        // =====================================================

        public List<PaymentResponse> getPaymentsByUser(
                        String userId) {

                return paymentRepository
                                .findByUserId(userId)
                                .stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        public String getUserEmail(String userId) {
                return userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId))
                                .getEmail();
        }

        // =====================================================
        // CONVERT PAYMENT TO RESPONSE
        // =====================================================

        private PaymentResponse convertToResponse(
                        Payment payment) {

                return new PaymentResponse(
                                payment.getId(),
                                payment.getUserId(),
                                payment.getChargingSessionId(),
                                payment.getAmount(),
                                payment.getStatus(),
                                payment.getPaymentMethod(),
                                payment.getTransactionId(),
                                payment.getPaymentDate());
        }
}