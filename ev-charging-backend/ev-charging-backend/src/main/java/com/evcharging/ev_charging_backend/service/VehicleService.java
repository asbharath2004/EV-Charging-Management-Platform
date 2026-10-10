package com.evcharging.ev_charging_backend.service;

import com.evcharging.ev_charging_backend.dto.VehicleRequest;
import com.evcharging.ev_charging_backend.dto.VehicleResponse;
import com.evcharging.ev_charging_backend.exception.ResourceNotFoundException;
import com.evcharging.ev_charging_backend.model.Vehicle;
import com.evcharging.ev_charging_backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }


    // =====================================================
    // CREATE VEHICLE
    // =====================================================

    public VehicleResponse createVehicle(
            VehicleRequest request) {

        Vehicle vehicle = new Vehicle();

        vehicle.setUserId(
                request.getUserId()
        );

        vehicle.setRegistrationNumber(
                request.getRegistrationNumber()
        );

        vehicle.setBrand(
                request.getBrand()
        );

        vehicle.setModel(
                request.getModel()
        );

        vehicle.setBatteryCapacity(
                request.getBatteryCapacity()
        );

        vehicle.setCurrentBatteryPercentage(
                request.getCurrentBatteryPercentage()
        );

        vehicle.setConnectorType(
                request.getConnectorType()
        );

        Vehicle savedVehicle =
                vehicleRepository.save(vehicle);

        return convertToResponse(
                savedVehicle
        );
    }


    // =====================================================
    // GET VEHICLE BY ID
    // =====================================================

    public VehicleResponse getVehicleById(
            String id) {

        Vehicle vehicle =
                vehicleRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Vehicle not found with id: "
                                                + id
                                )
                        );

        return convertToResponse(
                vehicle
        );
    }


    // =====================================================
    // GET ALL VEHICLES
    // =====================================================

    public List<VehicleResponse> getAllVehicles() {

        return vehicleRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =====================================================
    // GET VEHICLES BY USER
    // =====================================================

    public List<VehicleResponse> getVehiclesByUser(
            String userId) {

        return vehicleRepository
                .findByUserId(userId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =====================================================
    // UPDATE VEHICLE
    // =====================================================

    public VehicleResponse updateVehicle(
            String id,
            VehicleRequest request) {

        Vehicle existingVehicle =
                vehicleRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Vehicle not found with id: "
                                                + id
                                )
                        );


        existingVehicle.setUserId(
                request.getUserId()
        );

        existingVehicle.setRegistrationNumber(
                request.getRegistrationNumber()
        );

        existingVehicle.setBrand(
                request.getBrand()
        );

        existingVehicle.setModel(
                request.getModel()
        );

        existingVehicle.setBatteryCapacity(
                request.getBatteryCapacity()
        );

        existingVehicle.setCurrentBatteryPercentage(
                request.getCurrentBatteryPercentage()
        );

        existingVehicle.setConnectorType(
                request.getConnectorType()
        );


        Vehicle updatedVehicle =
                vehicleRepository.save(
                        existingVehicle
                );

        return convertToResponse(
                updatedVehicle
        );
    }


    // =====================================================
    // DELETE VEHICLE
    // =====================================================

    public void deleteVehicle(
            String id) {

        if (!vehicleRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Vehicle not found with id: " + id
            );
        }

        vehicleRepository.deleteById(id);
    }


    // =====================================================
    // CONVERT ENTITY TO RESPONSE
    // =====================================================

    private VehicleResponse convertToResponse(
            Vehicle vehicle) {

        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getUserId(),
                vehicle.getRegistrationNumber(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getBatteryCapacity(),
                vehicle.getCurrentBatteryPercentage(),
                vehicle.getConnectorType()
        );
    }
}