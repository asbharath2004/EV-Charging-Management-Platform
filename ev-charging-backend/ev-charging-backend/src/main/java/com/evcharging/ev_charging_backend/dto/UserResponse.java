package com.evcharging.ev_charging_backend.dto;

import com.evcharging.ev_charging_backend.model.Role;

public class UserResponse {

    private String id;
    private String name;
    private String email;
    private String phone;
    private Role role;

    public UserResponse() {
    }

    public UserResponse(
            String id,
            String name,
            String email,
            String phone) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = Role.USER;
    }

    public UserResponse(
            String id,
            String name,
            String email,
            String phone,
            Role role) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role != null ? role : Role.USER;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}