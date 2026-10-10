package com.evcharging.ev_charging_backend.repository;

import com.evcharging.ev_charging_backend.model.Booking;
import com.evcharging.ev_charging_backend.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository
        extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByPortId(String portId);

    List<Booking> findByStationId(String stationId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByPortIdAndStatus(
            String portId,
            BookingStatus status);
}