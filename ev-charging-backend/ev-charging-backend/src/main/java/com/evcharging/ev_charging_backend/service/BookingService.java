package com.evcharging.ev_charging_backend.service;

import com.evcharging.ev_charging_backend.dto.BookingRequest;
import com.evcharging.ev_charging_backend.dto.BookingResponse;
import com.evcharging.ev_charging_backend.exception.ResourceNotFoundException;
import com.evcharging.ev_charging_backend.model.Booking;
import com.evcharging.ev_charging_backend.model.BookingStatus;
import com.evcharging.ev_charging_backend.model.ChargingPort;
import com.evcharging.ev_charging_backend.model.PortStatus;
import com.evcharging.ev_charging_backend.model.User;
import com.evcharging.ev_charging_backend.model.ApprovalStatus;
import com.evcharging.ev_charging_backend.model.ChargingStation;
import com.evcharging.ev_charging_backend.model.Vehicle;
import com.evcharging.ev_charging_backend.repository.BookingRepository;
import com.evcharging.ev_charging_backend.repository.ChargingPortRepository;
import com.evcharging.ev_charging_backend.repository.ChargingStationRepository;
import com.evcharging.ev_charging_backend.repository.UserRepository;
import com.evcharging.ev_charging_backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BookingService {

        private final BookingRepository bookingRepository;
        private final UserRepository userRepository;
        private final VehicleRepository vehicleRepository;
        private final ChargingStationRepository chargingStationRepository;
        private final ChargingPortRepository chargingPortRepository;

        public BookingService(
                        BookingRepository bookingRepository,
                        UserRepository userRepository,
                        VehicleRepository vehicleRepository,
                        ChargingStationRepository chargingStationRepository,
                        ChargingPortRepository chargingPortRepository) {

                this.bookingRepository = bookingRepository;
                this.userRepository = userRepository;
                this.vehicleRepository = vehicleRepository;
                this.chargingStationRepository = chargingStationRepository;
                this.chargingPortRepository = chargingPortRepository;
        }

        // =====================================================
        // CREATE BOOKING
        // =====================================================

        public BookingResponse createBooking(
                        BookingRequest request,
                        Authentication authentication) {

                User authenticatedUser = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
                boolean allowedRole = authenticatedUser.getRole() == com.evcharging.ev_charging_backend.model.Role.USER
                                || authenticatedUser.getRole() == com.evcharging.ev_charging_backend.model.Role.FLEET_OPERATOR;
                if (!allowedRole) {
                        throw new AccessDeniedException("Only EV Drivers and Fleet Operators can create bookings.");
                }
                if (!authenticatedUser.getId().equals(request.getUserId())) {
                        throw new AccessDeniedException("Booking user does not match the authenticated user.");
                }

                // 1. Check user
                User user = userRepository.findById(
                                request.getUserId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "User not found with id: "
                                                                                + request.getUserId()));

                // 2. Check vehicle
                Vehicle vehicle = vehicleRepository.findById(
                                request.getVehicleId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Vehicle not found with id: "
                                                                                + request.getVehicleId()));

                // 3. Check vehicle belongs to user
                if (!vehicle.getUserId()
                                .equals(request.getUserId())) {

                        throw new IllegalArgumentException(
                                        "Vehicle does not belong to this user");
                }

                // 4. Check charging station
                ChargingStation station = chargingStationRepository.findById(
                                request.getStationId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Charging station not found with id: "
                                                                                + request.getStationId()));

                // 5. Check charging port
                ChargingPort port = chargingPortRepository.findById(
                                request.getPortId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Charging port not found with id: "
                                                                                + request.getPortId()));

                // 6. Check port belongs to station
                if (!port.getStationId()
                                .equals(request.getStationId())) {

                        throw new IllegalArgumentException(
                                        "Charging port does not belong to this station");
                }

                if (station.getApprovalStatus() != ApprovalStatus.APPROVED
                                || (port.getApprovalStatus() != null
                                                && port.getApprovalStatus() != ApprovalStatus.APPROVED)) {
                        throw new IllegalArgumentException("Only approved stations and charging ports can be booked.");
                }

                // 7. Check port availability
                if (port.getStatus() != PortStatus.AVAILABLE) {

                        throw new IllegalArgumentException(
                                        "Charging port is not available");
                }

                // 8. Create booking
                Booking booking = new Booking(
                                request.getUserId(),
                                request.getVehicleId(),
                                request.getStationId(),
                                request.getPortId(),
                                request.getStartTime(),
                                request.getEndTime(),
                                BookingStatus.PENDING);

                // 9. Save booking
                Booking savedBooking = bookingRepository.save(booking);

                // 10. Return response
                return convertToResponse(
                                savedBooking);
        }

        // =====================================================
        // GET BOOKING BY ID
        // =====================================================

        public BookingResponse getBookingById(
                        String id,
                        Authentication authentication) {

                Booking booking = bookingRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Booking not found with id: "
                                                                + id));

                ensureBookingAccess(booking, authentication);

                return convertToResponse(
                                booking);
        }

        // =====================================================
        // GET ALL BOOKINGS
        // =====================================================

        public List<BookingResponse> getAllBookings() {

                return bookingRepository.findAll()
                                .stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        // =====================================================
        // GET BOOKINGS BY USER
        // =====================================================

        public List<BookingResponse> getBookingsByUser(
                        String userId,
                        Authentication authentication) {

                User authenticatedUser = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
                boolean admin = authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
                if (!admin && !authenticatedUser.getId().equals(userId)) {
                        throw new AccessDeniedException("You are not authorized to view these bookings.");
                }

                if (!userRepository.existsById(userId)) {

                        throw new ResourceNotFoundException(
                                        "User not found with id: "
                                                        + userId);
                }

                return bookingRepository
                                .findByUserId(userId)
                                .stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        public List<BookingResponse> getBookingsForHost(String hostEmail) {
                User host = userRepository.findByEmail(hostEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                return chargingStationRepository.findByOwnerId(host.getId()).stream()
                                .flatMap(station -> bookingRepository.findByStationId(station.getId()).stream())
                                .map(this::convertToResponse)
                                .toList();
        }

        public List<BookingResponse> getBookingsForFleet(Authentication authentication) {
                boolean admin = authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
                if (admin) {
                        return getAllBookings();
                }

                User operator = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
                if (operator.getRole() != com.evcharging.ev_charging_backend.model.Role.FLEET_OPERATOR) {
                        throw new AccessDeniedException("Only Fleet Operators can access fleet bookings.");
                }

                Set<String> fleetVehicleIds = vehicleRepository.findByUserId(operator.getId()).stream()
                                .map(Vehicle::getId)
                                .collect(Collectors.toSet());

                return bookingRepository.findAll().stream()
                                .filter(booking -> fleetVehicleIds.contains(booking.getVehicleId()))
                                .map(this::convertToResponse)
                                .toList();
        }

        private void ensureBookingAccess(Booking booking, Authentication authentication) {
                boolean admin = authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
                if (admin) {
                        return;
                }
                User user = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
                if (user.getId().equals(booking.getUserId())) {
                        return;
                }
                boolean host = authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_STATION_HOST"));
                if (host && chargingStationRepository.findByOwnerId(user.getId()).stream()
                                .anyMatch(station -> station.getId().equals(booking.getStationId()))) {
                        return;
                }
                throw new AccessDeniedException("You are not authorized to view this booking.");
        }

        // =====================================================
        // UPDATE BOOKING
        // =====================================================

        public BookingResponse updateBooking(
                        String id,
                        BookingRequest request) {

                // 1. Find booking
                Booking existingBooking = bookingRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Booking not found with id: "
                                                                + id));

                // 2. Don't update completed booking
                if (existingBooking.getStatus() == BookingStatus.COMPLETED) {

                        throw new IllegalArgumentException(
                                        "Completed booking cannot be updated");
                }

                // 3. Don't update cancelled booking
                if (existingBooking.getStatus() == BookingStatus.CANCELLED) {

                        throw new IllegalArgumentException(
                                        "Cancelled booking cannot be updated");
                }

                // 4. Check user
                userRepository.findById(
                                request.getUserId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "User not found with id: "
                                                                                + request.getUserId()));

                // 5. Check vehicle
                Vehicle vehicle = vehicleRepository.findById(
                                request.getVehicleId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Vehicle not found with id: "
                                                                                + request.getVehicleId()));

                // 6. Check vehicle belongs to user
                if (!vehicle.getUserId()
                                .equals(request.getUserId())) {

                        throw new IllegalArgumentException(
                                        "Vehicle does not belong to this user");
                }

                // 7. Check station
                chargingStationRepository.findById(
                                request.getStationId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Charging station not found with id: "
                                                                                + request.getStationId()));

                // 8. Check port
                ChargingPort port = chargingPortRepository.findById(
                                request.getPortId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Charging port not found with id: "
                                                                                + request.getPortId()));

                // 9. Check port belongs to station
                if (!port.getStationId()
                                .equals(request.getStationId())) {

                        throw new IllegalArgumentException(
                                        "Charging port does not belong to this station");
                }

                // 10. Update booking
                existingBooking.setUserId(
                                request.getUserId());

                existingBooking.setVehicleId(
                                request.getVehicleId());

                existingBooking.setStationId(
                                request.getStationId());

                existingBooking.setPortId(
                                request.getPortId());

                existingBooking.setStartTime(
                                request.getStartTime());

                existingBooking.setEndTime(
                                request.getEndTime());

                // Status remains controlled by server
                Booking updatedBooking = bookingRepository.save(
                                existingBooking);

                return convertToResponse(
                                updatedBooking);
        }

        // =====================================================
        // CONFIRM BOOKING
        // =====================================================

        public BookingResponse confirmBooking(
                        String id,
                        Authentication authentication) {

                Booking booking = bookingRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Booking not found with id: "
                                                                + id));

                boolean admin = authentication != null && authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
                if (!admin) {
                        User host = userRepository.findByEmail(authentication.getName())
                                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                        boolean ownsStation = chargingStationRepository.findByOwnerId(host.getId()).stream()
                                        .anyMatch(station -> station.getId().equals(booking.getStationId()));
                        if (!ownsStation) {
                                throw new AccessDeniedException("You can only confirm bookings for your own station.");
                        }
                }

                // Only PENDING booking can be confirmed
                if (booking.getStatus() != BookingStatus.PENDING) {

                        throw new IllegalArgumentException(
                                        "Only pending bookings can be confirmed");
                }

                booking.setStatus(
                                BookingStatus.CONFIRMED);

                Booking confirmedBooking = bookingRepository.save(
                                booking);

                return convertToResponse(
                                confirmedBooking);
        }

        // =====================================================
        // CANCEL BOOKING
        // =====================================================

        public BookingResponse cancelBooking(
                        String id,
                        Authentication authentication) {

                Booking booking = bookingRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Booking not found with id: "
                                                                + id));

                boolean admin = authentication != null && authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
                if (!admin && authentication != null) {
                        User user = userRepository.findByEmail(authentication.getName())
                                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                        boolean isOwner = user.getId().equals(booking.getUserId());
                        boolean ownsStation = chargingStationRepository.findByOwnerId(user.getId()).stream()
                                        .anyMatch(station -> station.getId().equals(booking.getStationId()));
                        if (!isOwner && !ownsStation) {
                                throw new AccessDeniedException("You are not authorized to cancel this booking.");
                        }
                }

                // Completed booking cannot be cancelled
                if (booking.getStatus() == BookingStatus.COMPLETED) {

                        throw new IllegalArgumentException(
                                        "Completed booking cannot be cancelled");
                }

                // Already cancelled
                if (booking.getStatus() == BookingStatus.CANCELLED) {

                        throw new IllegalArgumentException(
                                        "Booking is already cancelled");
                }

                booking.setStatus(
                                BookingStatus.CANCELLED);

                Booking cancelledBooking = bookingRepository.save(
                                booking);

                return convertToResponse(
                                cancelledBooking);
        }

        // =====================================================
        // DELETE BOOKING
        // =====================================================

        public void deleteBooking(
                        String id) {

                if (!bookingRepository.existsById(id)) {

                        throw new ResourceNotFoundException(
                                        "Booking not found with id: "
                                                        + id);
                }

                bookingRepository.deleteById(id);
        }

        // =====================================================
        // CONVERT ENTITY TO RESPONSE
        // =====================================================

        private BookingResponse convertToResponse(
                        Booking booking) {

                return new BookingResponse(
                                booking.getId(),
                                booking.getUserId(),
                                booking.getVehicleId(),
                                booking.getStationId(),
                                booking.getPortId(),
                                booking.getStartTime(),
                                booking.getEndTime(),
                                booking.getStatus());
        }
}