package com.evcharging.ev_charging_backend.dto;

import jakarta.validation.constraints.NotBlank;

public class PaymentRequest {

    @NotBlank(message = "Charging session ID is required")
    private String chargingSessionId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    public PaymentRequest() {
    }

    public String getChargingSessionId() {
        return chargingSessionId;
    }

    public void setChargingSessionId(String chargingSessionId) {
        this.chargingSessionId = chargingSessionId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}