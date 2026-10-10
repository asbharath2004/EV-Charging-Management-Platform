package com.evcharging.ev_charging_backend.repository;

import com.evcharging.ev_charging_backend.model.Payment;
import com.evcharging.ev_charging_backend.model.PaymentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository
        extends MongoRepository<Payment, String> {

    Optional<Payment> findByChargingSessionId(
            String chargingSessionId);

    List<Payment> findByUserId(String userId);

    List<Payment> findByStatus(PaymentStatus status);
}