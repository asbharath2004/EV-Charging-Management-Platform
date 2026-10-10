package com.evcharging.ev_charging_backend.service;

import com.evcharging.ev_charging_backend.dto.UserRequest;
import com.evcharging.ev_charging_backend.dto.UserResponse;
import com.evcharging.ev_charging_backend.exception.DuplicateResourceException;
import com.evcharging.ev_charging_backend.exception.ResourceNotFoundException;
import com.evcharging.ev_charging_backend.model.User;
import com.evcharging.ev_charging_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse createUser(UserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already exists: " + request.getEmail());
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        User savedUser = userRepository.save(user);

        return convertToResponse(savedUser);
    }

    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public UserResponse getUserById(String id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id));

        return convertToResponse(user);
    }

    public void deleteUser(String id) {

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "User not found with id: " + id);
        }

        userRepository.deleteById(id);
    }

    public UserResponse updateUser(
            String id,
            UserRequest request) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id));

        existingUser.setName(request.getName());
        existingUser.setEmail(request.getEmail());
        existingUser.setPhone(request.getPhone());

        User updatedUser =
                userRepository.save(existingUser);

        return convertToResponse(updatedUser);
    }

    public UserResponse convertToResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );
    }
}