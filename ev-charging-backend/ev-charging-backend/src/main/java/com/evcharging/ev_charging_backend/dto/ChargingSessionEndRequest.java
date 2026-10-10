package com.evcharging.ev_charging_backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ChargingSessionEndRequest {

    @NotNull(message = "Energy consumed is required")
    @Positive(message = "Energy consumed must be greater than zero")
    private Double energyConsumedKwh;

    public ChargingSessionEndRequest() {
    }

    public Double getEnergyConsumedKwh() {
        return energyConsumedKwh;
    }

    public void setEnergyConsumedKwh(Double energyConsumedKwh) {
        this.energyConsumedKwh = energyConsumedKwh;
    }
}