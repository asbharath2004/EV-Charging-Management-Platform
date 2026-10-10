package com.evcharging.ev_charging_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class BookingRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    @NotBlank(message = "Station ID is required")
    private String stationId;

    @NotBlank(message = "Port ID is required")
    private String portId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    public BookingRequest() {
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

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
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

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
}