package com.evcharging.ev_charging_backend.service;

import com.evcharging.ev_charging_backend.dto.AuthResponse;
import com.evcharging.ev_charging_backend.dto.LoginRequest;
import com.evcharging.ev_charging_backend.dto.RegisterRequest;
import com.evcharging.ev_charging_backend.dto.UserResponse;
import com.evcharging.ev_charging_backend.exception.DuplicateResourceException;
import com.evcharging.ev_charging_backend.exception.ResourceNotFoundException;
import com.evcharging.ev_charging_backend.model.Role;
import com.evcharging.ev_charging_backend.model.User;
import com.evcharging.ev_charging_backend.model.ApprovalStatus;
import com.evcharging.ev_charging_backend.model.ChargingStation;
import com.evcharging.ev_charging_backend.model.StationStatus;
import com.evcharging.ev_charging_backend.repository.UserRepository;
import com.evcharging.ev_charging_backend.repository.ChargingStationRepository;
import com.evcharging.ev_charging_backend.security.JwtUtils;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final ChargingStationRepository chargingStationRepository;

    public AuthService(UserRepository userRepository, UserService userService, PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils, ChargingStationRepository chargingStationRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.chargingStationRepository = chargingStationRepository;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }

        Role requestedRole = request.getRole();
        // Guard against unauthorized public registration as ADMIN
        if (requestedRole == Role.ADMIN) {
            requestedRole = Role.USER;
        } else if (requestedRole == null) {
            requestedRole = Role.USER;
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                passwordEncoder.encode(request.getPassword()),
                requestedRole);

        User savedUser = userRepository.save(user);
        if (requestedRole == Role.STATION_HOST) {
            if (request.getStationName() == null || request.getStationName().isBlank()
                    || request.getStationAddress() == null || request.getStationAddress().isBlank()
                    || request.getStationLatitude() == null || request.getStationLongitude() == null) {
                userRepository.delete(savedUser);
                throw new IllegalArgumentException(
                        "Station name, address, latitude, and longitude are required for Station Host registration.");
            }
            ChargingStation station = new ChargingStation();
            station.setName(request.getStationName());
            station.setAddress(request.getStationAddress());
            station.setLatitude(request.getStationLatitude());
            station.setLongitude(request.getStationLongitude());
            station.setStatus(StationStatus.AVAILABLE);
            station.setApprovalStatus(ApprovalStatus.PENDING);
            station.setOwnerId(savedUser.getId());
            chargingStationRepository.save(station);
        }
        UserResponse response = userService.convertToResponse(savedUser);
        String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId());

        return new AuthResponse(token, response);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new BadCredentialsException("Account requires a password reset");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        UserResponse userResponse = userService.convertToResponse(user);
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return new AuthResponse(token, userResponse);
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return userService.convertToResponse(user);
    }
}
