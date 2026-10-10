package com.evcharging.ev_charging_backend.dto;

import com.evcharging.ev_charging_backend.model.BookingStatus;

import java.time.LocalDateTime;

public class BookingResponse {

    private String id;
    private String userId;
    private String vehicleId;
    private String stationId;
    private String portId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;

    public BookingResponse(
            String id,
            String userId,
            String vehicleId,
            String stationId,
            String portId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            BookingStatus status) {

        this.id = id;
        this.userId = userId;
        this.vehicleId = vehicleId;
        this.stationId = stationId;
        this.portId = portId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    public String getId() {
        return id;
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

    public BookingStatus getStatus() {
        return status;
    }
}