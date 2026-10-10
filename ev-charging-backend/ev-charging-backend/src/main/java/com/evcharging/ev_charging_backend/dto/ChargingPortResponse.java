package com.evcharging.ev_charging_backend.dto;

import com.evcharging.ev_charging_backend.model.ConnectorType;
import com.evcharging.ev_charging_backend.model.PortStatus;
import com.evcharging.ev_charging_backend.model.ApprovalStatus;

public class ChargingPortResponse {

    private String id;
    private String stationId;
    private Integer portNumber;
    private ConnectorType connectorType;
    private Double powerKw;
    private PortStatus status;
    private Double pricePerKwh;
    private ApprovalStatus approvalStatus;
    private String rejectionReason;

    public ChargingPortResponse(
            String id,
            String stationId,
            Integer portNumber,
            ConnectorType connectorType,
            Double powerKw,
            PortStatus status,
            Double pricePerKwh,
            ApprovalStatus approvalStatus,
            String rejectionReason) {

        this.id = id;
        this.stationId = stationId;
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