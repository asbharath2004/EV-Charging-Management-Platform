package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.BookingResponse;
import com.evcharging.ev_charging_backend.dto.ChargingSessionResponse;
import com.evcharging.ev_charging_backend.dto.ChargingStationResponse;
import com.evcharging.ev_charging_backend.dto.PaymentResponse;
import com.evcharging.ev_charging_backend.model.ApprovalStatus;
import com.evcharging.ev_charging_backend.service.BookingService;
import com.evcharging.ev_charging_backend.service.ChargingSessionService;
import com.evcharging.ev_charging_backend.service.ChargingStationService;
import com.evcharging.ev_charging_backend.service.PaymentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.evcharging.ev_charging_backend.dto.AdminChargingPortResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDataController {

    private final BookingService bookingService;
    private final ChargingSessionService chargingSessionService;
    private final PaymentService paymentService;
    private final ChargingStationService chargingStationService;
    private final AdminPortController adminPortController;

    public AdminDataController(BookingService bookingService,
            ChargingSessionService chargingSessionService,
            PaymentService paymentService,
            ChargingStationService chargingStationService,
            AdminPortController adminPortController) {
        this.bookingService = bookingService;
        this.chargingSessionService = chargingSessionService;
        this.paymentService = paymentService;
        this.chargingStationService = chargingStationService;
        this.adminPortController = adminPortController;
    }

    @GetMapping("/bookings")
    public List<BookingResponse> getBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/sessions")
    public List<ChargingSessionResponse> getSessions() {
        return chargingSessionService.getAllSessions();
    }

    @GetMapping("/payments")
    public List<PaymentResponse> getPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/station-requests")
    public List<ChargingStationResponse> getStationRequests() {
        return chargingStationService.getStationsByApprovalStatus(ApprovalStatus.PENDING);
    }

    @GetMapping("/port-requests")
    public List<AdminChargingPortResponse> getPortRequests() {
        return adminPortController.pending();
    }
}