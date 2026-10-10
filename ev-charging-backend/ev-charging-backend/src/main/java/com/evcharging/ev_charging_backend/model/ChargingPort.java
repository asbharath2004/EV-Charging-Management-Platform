package com.evcharging.ev_charging_backend.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "charging_ports")
public class ChargingPort {

    @Id
    private String id;

    @NotNull(message = "Station ID is required")
    private String stationId;

    @NotNull(message = "Port number is required")
    @Min(value = 1, message = "Port number must be at least 1")
    private Integer portNumber;

    @NotNull(message = "Connector type is required")
    private ConnectorType connectorType;

    @NotNull(message = "Power rating is required")
    @Positive(message = "Power rating must be greater than 0")
    private Double powerKw;

    @NotNull(message = "Port status is required")
    private PortStatus status;

    @NotNull(message = "Price per kWh is required")
    @Positive(message = "Price per kWh must be greater than 0")
    private Double pricePerKwh;
    private ApprovalStatus approvalStatus;
    private String rejectionReason;

    public ChargingPort() {
    }

    public void initializeApproval() {
        if (approvalStatus == null)
            approvalStatus = ApprovalStatus.PENDING;
    }

    public ChargingPort(String stationId,
            Integer portNumber,
            ConnectorType connectorType,
            Double powerKw,
            PortStatus status,
            Double pricePerKwh) {

        this.stationId = stationId;
        this.portNumber = portNumber;
        this.connectorType = connectorType;
        this.powerKw = powerKw;
        this.status = status;
        this.pricePerKwh = pricePerKwh;
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

    public void setId(String id) {
        this.id = id;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
    }

    public void setPortNumber(Integer portNumber) {
        this.portNumber = portNumber;
    }

    public void setConnectorType(ConnectorType connectorType) {
        this.connectorType = connectorType;
    }

    public void setPowerKw(Double powerKw) {
        this.powerKw = powerKw;
    }

    public void setStatus(PortStatus status) {
        this.status = status;
    }

    public void setPricePerKwh(Double pricePerKwh) {
        this.pricePerKwh = pricePerKwh;
    }

    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}