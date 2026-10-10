package com.evcharging.ev_charging_backend.controller;

import com.evcharging.ev_charging_backend.dto.UserRequest;
import com.evcharging.ev_charging_backend.dto.UserResponse;
import com.evcharging.ev_charging_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(
            @Valid @RequestBody UserRequest request) {

        return userService.createUser(request);
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {

        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(
            @PathVariable String id) {

        return userService.getUserById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(
            @PathVariable String id) {

        userService.deleteUser(id);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserRequest request) {

        return userService.updateUser(id, request);
    }
}