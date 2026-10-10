package com.evcharging.ev_charging_backend.dto;

import com.evcharging.ev_charging_backend.model.ConnectorType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ChargingPortRequest {

    @NotBlank(message = "Station ID is required")
    private String stationId;

    @NotNull(message = "Port number is required")
    @Min(value = 1, message = "Port number must be at least 1")
    private Integer portNumber;

    @NotNull(message = "Connector type is required")
    private ConnectorType connectorType;

    @NotNull(message = "Power rating is required")
    @Positive(message = "Power rating must be greater than 0")
    private Double powerKw;

    @NotNull(message = "Price per kWh is required")
    @Positive(message = "Price per kWh must be greater than 0")
    private Double pricePerKwh;

    public ChargingPortRequest() {
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

    public Double getPricePerKwh() {
        return pricePerKwh;
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

    public void setPricePerKwh(Double pricePerKwh) {
        this.pricePerKwh = pricePerKwh;
    }
}