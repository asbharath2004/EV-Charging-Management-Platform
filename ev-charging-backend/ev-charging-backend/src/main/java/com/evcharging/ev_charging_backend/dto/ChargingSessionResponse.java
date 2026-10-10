package com.evcharging.ev_charging_backend.dto;

import com.evcharging.ev_charging_backend.model.ChargingSessionStatus;
import com.evcharging.ev_charging_backend.model.PaymentStatus;

import java.time.LocalDateTime;

public class ChargingSessionResponse {

    private String id;
    private String bookingId;
    private String userId;
    private String vehicleId;
    private String stationId;
    private String portId;

    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;

    private Double energyConsumedKwh;
    private Double cost;

    private ChargingSessionStatus status;
    private PaymentStatus paymentStatus;

    private LocalDateTime createdAt;

    public ChargingSessionResponse(
            String id,
            String bookingId,
            String userId,
            String vehicleId,
            String stationId,
            String portId,
            LocalDateTime actualStartTime,
            LocalDateTime actualEndTime,
            Double energyConsumedKwh,
            Double cost,
            ChargingSessionStatus status,
            PaymentStatus paymentStatus,
            LocalDateTime createdAt) {

        this.id = id;
        this.bookingId = bookingId;
        this.userId = userId;
        this.vehicleId = vehicleId;
        this.stationId = stationId;
        this.portId = portId;
        this.actualStartTime = actualStartTime;
        this.actualEndTime = actualEndTime;
        this.energyConsumedKwh = energyConsumedKwh;
        this.cost = cost;
        this.status = status;
        this.paymentStatus = paymentStatus;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public String getBookingId() {
        return bookingId;
    }

    public String getUserId() {
        return userId;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public String getStationId() {
        return stationId;
    }

    public String getPortId() {
        return portId;
    }

    public LocalDateTime getActualStartTime() {
        return actualStartTime;
    }

    public LocalDateTime getActualEndTime() {
        return actualEndTime;
    }

    public Double getEnergyConsumedKwh() {
        return energyConsumedKwh;
    }

    public Double getCost() {
        return cost;
    }

    public ChargingSessionStatus getStatus() {
        return status;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}