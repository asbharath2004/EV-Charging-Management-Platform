package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.BookingRequest;
import com.evcharging.ev_charging_backend.dto.BookingResponse;
import com.evcharging.ev_charging_backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

        private final BookingService bookingService;

        public BookingController(
                        BookingService bookingService) {

                this.bookingService = bookingService;
        }

        // =====================================================
        // CREATE BOOKING
        // =====================================================

        @PostMapping
        @PreAuthorize("hasAnyRole('USER', 'FLEET_OPERATOR')")
        @ResponseStatus(HttpStatus.CREATED)
        public BookingResponse createBooking(
                        @Valid @RequestBody BookingRequest request,
                        Authentication authentication) {

                return bookingService.createBooking(
                                request,
                                authentication);
        }

        // =====================================================
        // GET ALL BOOKINGS
        // =====================================================

        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        public List<BookingResponse> getAllBookings() {

                return bookingService.getAllBookings();
        }

        @GetMapping("/host")
        @PreAuthorize("hasAnyRole('STATION_HOST', 'ADMIN')")
        public List<BookingResponse> getHostBookings(Authentication authentication) {
                return bookingService.getBookingsForHost(authentication.getName());
        }

        @GetMapping("/fleet")
        @PreAuthorize("hasAnyRole('FLEET_OPERATOR', 'ADMIN')")
        public List<BookingResponse> getFleetBookings(Authentication authentication) {
                return bookingService.getBookingsForFleet(authentication);
        }

        // =====================================================
        // GET BOOKINGS BY USER
        // =====================================================

        @GetMapping("/user/{userId}")
        @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
        public List<BookingResponse> getBookingsByUser(
                        @PathVariable String userId,
                        Authentication authentication) {

                return bookingService.getBookingsByUser(
                                userId, authentication);
        }

        // =====================================================
        // GET BOOKING BY ID
        // =====================================================

        @GetMapping("/{id}")
        public BookingResponse getBookingById(
                        @PathVariable String id,
                        Authentication authentication) {

                return bookingService.getBookingById(
                                id, authentication);
        }

        // =====================================================
        // UPDATE BOOKING
        // =====================================================

        @PutMapping("/{id}")
        public BookingResponse updateBooking(
                        @PathVariable String id,
                        @Valid @RequestBody BookingRequest request) {

                return bookingService.updateBooking(
                                id,
                                request);
        }

        // =====================================================
        // CONFIRM BOOKING (STATION HOST / ADMIN ONLY)
        // =====================================================

        @PutMapping("/{id}/confirm")
        @PreAuthorize("hasAnyRole('STATION_HOST', 'ADMIN')")
        public BookingResponse confirmBooking(
                        @PathVariable String id,
                        Authentication authentication) {

                return bookingService.confirmBooking(
                                id, authentication);
        }

        // =====================================================
        // CANCEL BOOKING
        // =====================================================

        @PutMapping("/{id}/cancel")
        @PreAuthorize("hasAnyRole('USER', 'STATION_HOST', 'ADMIN')")
        public BookingResponse cancelBooking(
                        @PathVariable String id,
                        Authentication authentication) {

                return bookingService.cancelBooking(
                                id, authentication);
        }

        // =====================================================
        // DELETE BOOKING
        // =====================================================

        @DeleteMapping("/{id}")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public void deleteBooking(
                        @PathVariable String id) {

                bookingService.deleteBooking(
                                id);
        }
}