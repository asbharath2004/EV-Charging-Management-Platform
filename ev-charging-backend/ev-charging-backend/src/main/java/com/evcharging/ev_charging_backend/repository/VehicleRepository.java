package com.evcharging.ev_charging_backend.repository;

import com.evcharging.ev_charging_backend.model.Vehicle;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface VehicleRepository
        extends MongoRepository<Vehicle, String> {

    List<Vehicle> findByUserId(String userId);
}