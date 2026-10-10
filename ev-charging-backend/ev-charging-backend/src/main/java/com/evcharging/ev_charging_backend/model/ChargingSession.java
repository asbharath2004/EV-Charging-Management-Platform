package com.evcharging.ev_charging_backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "charging_sessions")
public class ChargingSession {

    @Id
    private String id;

    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    @NotBlank(message = "Station ID is required")
    private String stationId;

    @NotBlank(message = "Port ID is required")
    private String portId;

    @NotNull(message = "Actual start time is required")
    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    @PositiveOrZero(message = "Energy consumed cannot be negative")
    private Double energyConsumedKwh;

    @PositiveOrZero(message = "Cost cannot be negative")
    private Double cost;

    @NotNull(message = "Session status is required")
    private ChargingSessionStatus status;

    private LocalDateTime createdAt;

    public ChargingSession() {
    }

    public ChargingSession(
            String bookingId,
            String userId,
            String vehicleId,
            String stationId,
            String portId,
            LocalDateTime actualStartTime,
            ChargingSessionStatus status) {

        this.bookingId = bookingId;
        this.userId = userId;
        this.vehicleId = vehicleId;
        this.stationId = stationId;
        this.portId = portId;
        this.actualStartTime = actualStartTime;
        this.status = status;
        this.createdAt = LocalDateTime.now();
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
    }

    public void setPortId(String portId) {
        this.portId = portId;
    }

    public void setActualStartTime(LocalDateTime actualStartTime) {
        this.actualStartTime = actualStartTime;
    }

    public void setActualEndTime(LocalDateTime actualEndTime) {
        this.actualEndTime = actualEndTime;
    }

    public void setEnergyConsumedKwh(Double energyConsumedKwh) {
        this.energyConsumedKwh = energyConsumedKwh;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }

    public void setStatus(ChargingSessionStatus status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}