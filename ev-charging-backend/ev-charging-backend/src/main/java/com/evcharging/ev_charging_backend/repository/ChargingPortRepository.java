package com.evcharging.ev_charging_backend.repository;

import com.evcharging.ev_charging_backend.model.ChargingPort;
import com.evcharging.ev_charging_backend.model.ApprovalStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChargingPortRepository
        extends MongoRepository<ChargingPort, String> {

    List<ChargingPort> findByStationId(String stationId);

    List<ChargingPort> findByApprovalStatus(ApprovalStatus approvalStatus);
}