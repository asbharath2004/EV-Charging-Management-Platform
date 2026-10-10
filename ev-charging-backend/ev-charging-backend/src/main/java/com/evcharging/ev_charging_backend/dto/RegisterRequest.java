package com.evcharging.ev_charging_backend.dto;

import com.evcharging.ev_charging_backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private Role role;
    private String stationName;
    private String stationAddress;
    private Double stationLatitude;
    private Double stationLongitude;

    public RegisterRequest() {
    }

    public RegisterRequest(String name, String email, String phone, String password, Role role) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.role = role;
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

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }

    public String getStationName() {
        return stationName;
    }

    public String getStationAddress() {
        return stationAddress;
    }

    public Double getStationLatitude() {
        return stationLatitude;
    }

    public Double getStationLongitude() {
        return stationLongitude;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
    }

    public void setStationAddress(String stationAddress) {
        this.stationAddress = stationAddress;
    }

    public void setStationLatitude(Double stationLatitude) {
        this.stationLatitude = stationLatitude;
    }

    public void setStationLongitude(Double stationLongitude) {
        this.stationLongitude = stationLongitude;
    }
}
