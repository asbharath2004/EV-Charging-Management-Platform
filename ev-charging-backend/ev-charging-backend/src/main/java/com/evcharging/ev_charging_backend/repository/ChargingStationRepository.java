package com.evcharging.ev_charging_backend.repository;

import com.evcharging.ev_charging_backend.model.ApprovalStatus;
import com.evcharging.ev_charging_backend.model.ChargingStation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ChargingStationRepository
                extends MongoRepository<ChargingStation, String> {

        List<ChargingStation> findByApprovalStatus(
                        ApprovalStatus approvalStatus);

        Optional<ChargingStation> findFirstByOwnerId(String ownerId);

        List<ChargingStation> findByOwnerId(String ownerId);
}