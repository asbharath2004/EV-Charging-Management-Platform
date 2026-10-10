package com.evcharging.ev_charging_backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "charging_stations")
public class ChargingStation {

    @Id
    private String id;

    @NotBlank(message = "Station name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotNull(message = "Station status is required")
    private StationStatus status;

    // NEW
    private ApprovalStatus approvalStatus;

    // NEW
    private String rejectionReason;

    // NEW
    private String ownerId;

    public ChargingStation() {
    }

    public ChargingStation(
            String name,
            String address,
            Double latitude,
            Double longitude,
            StationStatus status) {

        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
        this.approvalStatus = ApprovalStatus.PENDING;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public StationStatus getStatus() {
        return status;
    }

    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public void setStatus(StationStatus status) {
        this.status = status;
    }

    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }
}