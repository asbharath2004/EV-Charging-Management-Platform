package com.evcharging.ev_charging_backend.dto;

import com.evcharging.ev_charging_backend.model.ApprovalStatus;
import com.evcharging.ev_charging_backend.model.ConnectorType;
import com.evcharging.ev_charging_backend.model.PortStatus;

public class AdminChargingPortResponse {
    private final String id;
    private final String stationId;
    private final String stationName;
    private final String stationAddress;
    private final String ownerId;
    private final String ownerName;
    private final String ownerEmail;
    private final Integer portNumber;
    private final ConnectorType connectorType;
    private final Double powerKw;
    private final PortStatus status;
    private final Double pricePerKwh;
    private final ApprovalStatus approvalStatus;
    private final String rejectionReason;

    public AdminChargingPortResponse(String id, String stationId, String stationName, String stationAddress,
            String ownerId, String ownerName, String ownerEmail, Integer portNumber,
            ConnectorType connectorType, Double powerKw, PortStatus status, Double pricePerKwh,
            ApprovalStatus approvalStatus, String rejectionReason) {
        this.id = id;
        this.stationId = stationId;
        this.stationName = stationName;
        this.stationAddress = stationAddress;
        this.ownerId = ownerId;
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
        this.portNumber = portNumber;
        this.connectorType = connectorType;
        this.powerKw = powerKw;
        this.status = status;
        this.pricePerKwh = pricePerKwh;
        this.approvalStatus = approvalStatus;
        this.rejectionReason = rejectionReason;
    }

    public String getId() {
        return id;
    }

    public String getStationId() {
        return stationId;
    }

    public String getStationName() {
        return stationName;
    }

    public String getStationAddress() {
        return stationAddress;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public Integer getPortNumber() {
        return portNumber;
    }

    public ConnectorType getConnectorType() {
        return connectorType;
    }

    public Double getPowerKw() {
        return powerKw;
    }

    public PortStatus getStatus() {
        return status;
    }

    public Double getPricePerKwh() {
        return pricePerKwh;
    }

    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }
}
