package com.evcharging.ev_charging_backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "vehicles")
public class Vehicle {

    @Id
    private String id;

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

    private LocalDateTime createdAt;

    public Vehicle() {
    }

    public Vehicle(String userId,
                   String registrationNumber,
                   String brand,
                   String model,
                   Double batteryCapacity,
                   Double currentBatteryPercentage,
                   ConnectorType connectorType) {

        this.userId = userId;
        this.registrationNumber = registrationNumber;
        this.brand = brand;
        this.model = model;
        this.batteryCapacity = batteryCapacity;
        this.currentBatteryPercentage = currentBatteryPercentage;
        this.connectorType = connectorType;
        this.createdAt = LocalDateTime.now();
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(String id) {
        this.id = id;
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

    public void setCurrentBatteryPercentage(Double currentBatteryPercentage) {
        this.currentBatteryPercentage = currentBatteryPercentage;
    }

    public void setConnectorType(ConnectorType connectorType) {
        this.connectorType = connectorType;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}