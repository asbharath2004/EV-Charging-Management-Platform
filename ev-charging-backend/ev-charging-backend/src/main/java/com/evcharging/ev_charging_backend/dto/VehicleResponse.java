package com.evcharging.ev_charging_backend.dto;

import com.evcharging.ev_charging_backend.model.ConnectorType;

public class VehicleResponse {

    private String id;
    private String userId;
    private String registrationNumber;
    private String brand;
    private String model;
    private Double batteryCapacity;
    private Double currentBatteryPercentage;
    private ConnectorType connectorType;

    public VehicleResponse(
            String id,
            String userId,
            String registrationNumber,
            String brand,
            String model,
            Double batteryCapacity,
            Double currentBatteryPercentage,
            ConnectorType connectorType) {

        this.id = id;
        this.userId = userId;
        this.registrationNumber = registrationNumber;
        this.brand = brand;
        this.model = model;
        this.batteryCapacity = batteryCapacity;
        this.currentBatteryPercentage =
                currentBatteryPercentage;
        this.connectorType = connectorType;
    }

    public String getId() {
        return id;
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
}