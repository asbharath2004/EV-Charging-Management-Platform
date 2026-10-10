package com.evcharging.ev_charging_backend.dto;

import jakarta.validation.constraints.NotBlank;

public class ChargingSessionRequest {

    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    public ChargingSessionRequest() {
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }
}