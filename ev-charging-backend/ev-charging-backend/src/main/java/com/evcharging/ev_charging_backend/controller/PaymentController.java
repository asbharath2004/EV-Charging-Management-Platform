package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.PaymentRequest;
import com.evcharging.ev_charging_backend.dto.PaymentResponse;
import com.evcharging.ev_charging_backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // =====================================================
    // CREATE PAYMENT
    // =====================================================

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse createPayment(
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication) {

        return paymentService.createPayment(request, authentication);
    }

    // =====================================================
    // GET MY PAYMENTS - NORMAL EV USER
    // =====================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public List<PaymentResponse> getMyPayments(
            Authentication authentication) {

        return paymentService.getPaymentsForRole(authentication);
    }

    @GetMapping("/host")
    @PreAuthorize("hasRole('STATION_HOST')")
    public List<PaymentResponse> getHostRevenue(
            Authentication authentication) {

        return paymentService.getPaymentsForHost(authentication);
    }

    // =====================================================
    // GET ALL PAYMENTS
    // ADMIN ONLY
    // =====================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PaymentResponse> getAllPayments() {

        return paymentService.getAllPayments();
    }

    @GetMapping("/fleet")
    @PreAuthorize("hasAnyRole('FLEET_OPERATOR', 'ADMIN')")
    public List<PaymentResponse> getFleetPayments(Authentication authentication) {
        return paymentService.getPaymentsForFleet(authentication);
    }

    // =====================================================
    // GET PAYMENTS BY USER
    // ADMIN / OWNER USER ONLY
    // =====================================================

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<PaymentResponse> getPaymentsByUser(
            @PathVariable String userId,
            Authentication authentication) {

        paymentService.validateUserAccess(userId, authentication);
        return paymentService.getPaymentsByUser(userId);
    }

    // =====================================================
    // GET PAYMENT BY ID
    // =====================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'FLEET_OPERATOR', 'STATION_HOST')")
    public PaymentResponse getPaymentById(
            @PathVariable String id) {

        return paymentService.getPaymentById(id);
    }
}