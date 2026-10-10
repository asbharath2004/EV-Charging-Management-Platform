package com.evcharging.ev_charging_backend.repository;

import com.evcharging.ev_charging_backend.model.ChargingSession;
import com.evcharging.ev_charging_backend.model.ChargingSessionStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ChargingSessionRepository
        extends MongoRepository<ChargingSession, String> {

    Optional<ChargingSession> findByBookingId(String bookingId);

    List<ChargingSession> findByUserId(String userId);

    List<ChargingSession> findByVehicleId(String vehicleId);

    List<ChargingSession> findByStationId(String stationId);

    List<ChargingSession> findByPortId(String portId);

    List<ChargingSession> findByStatus(
            ChargingSessionStatus status);
}