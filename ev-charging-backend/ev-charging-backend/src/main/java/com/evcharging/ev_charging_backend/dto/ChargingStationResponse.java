package com.evcharging.ev_charging_backend.dto;

import com.evcharging.ev_charging_backend.model.ApprovalStatus;
import com.evcharging.ev_charging_backend.model.StationStatus;

public class ChargingStationResponse {

    private String id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private StationStatus status;

    private ApprovalStatus approvalStatus;
    private String rejectionReason;
    private String ownerId;

    public ChargingStationResponse() {
    }

    public ChargingStationResponse(
            String id,
            String name,
            String address,
            Double latitude,
            Double longitude,
            StationStatus status,
            ApprovalStatus approvalStatus,
            String rejectionReason,
            String ownerId) {

        this.id = id;
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
        this.approvalStatus = approvalStatus;
        this.rejectionReason = rejectionReason;
        this.ownerId = ownerId;
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

    public void setApprovalStatus(
            ApprovalStatus approvalStatus) {

        this.approvalStatus = approvalStatus;
    }

    public void setRejectionReason(
            String rejectionReason) {

        this.rejectionReason = rejectionReason;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }
}