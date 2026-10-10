package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.VehicleRequest;
import com.evcharging.ev_charging_backend.dto.VehicleResponse;
import com.evcharging.ev_charging_backend.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VehicleResponse createVehicle(
            @Valid @RequestBody VehicleRequest request) {

        return vehicleService.createVehicle(request);
    }

    @GetMapping
    public List<VehicleResponse> getAllVehicles() {
        return vehicleService.getAllVehicles();
    }

    @GetMapping("/user/{userId}")
    public List<VehicleResponse> getVehiclesByUser(
            @PathVariable String userId) {

        return vehicleService.getVehiclesByUser(userId);
    }

    @GetMapping("/{id}")
    public VehicleResponse getVehicleById(
            @PathVariable String id) {

        return vehicleService.getVehicleById(id);
    }

    @PutMapping("/{id}")
    public VehicleResponse updateVehicle(
            @PathVariable String id,
            @Valid @RequestBody VehicleRequest request) {

        return vehicleService.updateVehicle(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVehicle(
            @PathVariable String id) {

        vehicleService.deleteVehicle(id);
    }
}