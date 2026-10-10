package com.evcharging.ev_charging_backend.dto;

import com.evcharging.ev_charging_backend.model.PaymentStatus;

import java.time.LocalDateTime;

public class PaymentResponse {

    private String id;
    private String userId;
    private String chargingSessionId;
    private Double amount;
    private PaymentStatus status;
    private String paymentMethod;
    private String transactionId;
    private LocalDateTime paymentDate;

    public PaymentResponse(
            String id,
            String userId,
            String chargingSessionId,
            Double amount,
            PaymentStatus status,
            String paymentMethod,
            String transactionId,
            LocalDateTime paymentDate) {

        this.id = id;
        this.userId = userId;
        this.chargingSessionId = chargingSessionId;
        this.amount = amount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.transactionId = transactionId;
        this.paymentDate = paymentDate;
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getChargingSessionId() {
        return chargingSessionId;
    }

    public Double getAmount() {
        return amount;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }
}