package com.evcharging.ev_charging_backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Charging session ID is required")
    private String chargingSessionId;

    @NotNull(message = "Amount is required")
    @PositiveOrZero(message = "Amount cannot be negative")
    private Double amount;

    @NotNull(message = "Payment status is required")
    private PaymentStatus status;

    private String paymentMethod;

    private String transactionId;

    private LocalDateTime paymentDate;

    public Payment() {
    }

    public Payment(
            String userId,
            String chargingSessionId,
            Double amount,
            PaymentStatus status,
            String paymentMethod,
            String transactionId) {

        this.userId = userId;
        this.chargingSessionId = chargingSessionId;
        this.amount = amount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.transactionId = transactionId;
        this.paymentDate = LocalDateTime.now();
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

    public void setId(String id) {
        this.id = id;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setChargingSessionId(String chargingSessionId) {
        this.chargingSessionId = chargingSessionId;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }
}