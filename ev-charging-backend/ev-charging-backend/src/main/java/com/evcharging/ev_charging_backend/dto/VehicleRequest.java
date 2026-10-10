package com.evcharging.ev_charging_backend.dto;

import com.evcharging.ev_charging_backend.model.ConnectorType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public class VehicleRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Battery capacity is required")
    @Positive(message = "Battery capacity must be greater than 0")
    private Double batteryCapacity;

    @NotNull(message = "Current battery percentage is required")
    @PositiveOrZero(message = "Battery percentage cannot be negative")
    private Double currentBatteryPercentage;

    @NotNull(message = "Connector type is required")
    private ConnectorType connectorType;

    public VehicleRequest() {
    }

    public String getUserId() {
        return userId;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public String getBrand() {
        return brand;
    }

    public String getModel() {
        return model;
    }

    public Double getBatteryCapacity() {
        return batteryCapacity;
    }

    public Double getCurrentBatteryPercentage() {
        return currentBatteryPercentage;
    }

    public ConnectorType getConnectorType() {
        return connectorType;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public void setBatteryCapacity(Double batteryCapacity) {
        this.batteryCapacity = batteryCapacity;
    }

    public void setCurrentBatteryPercentage(
            Double currentBatteryPercentage) {

        this.currentBatteryPercentage =
                currentBatteryPercentage;
    }

    public void setConnectorType(
            ConnectorType connectorType) {

        this.connectorType = connectorType;
    }
}