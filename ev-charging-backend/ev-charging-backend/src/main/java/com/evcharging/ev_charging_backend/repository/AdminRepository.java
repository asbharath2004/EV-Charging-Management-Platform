package com.evcharging.ev_charging_backend.repository;

import com.evcharging.ev_charging_backend.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AdminRepository extends MongoRepository<Admin, String> {

    Optional<Admin> findByEmail(String email);

    boolean existsByEmail(String email);
}