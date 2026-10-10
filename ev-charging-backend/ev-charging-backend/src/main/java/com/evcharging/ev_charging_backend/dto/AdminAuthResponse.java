package com.evcharging.ev_charging_backend.dto;

public class AdminAuthResponse {

    private String token;
    private AdminResponse admin;

    public AdminAuthResponse() {
    }

    public AdminAuthResponse(String token, AdminResponse admin) {
        this.token = token;
        this.admin = admin;
    }

    public String getToken() {
        return token;
    }

    public AdminResponse getAdmin() {
        return admin;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setAdmin(AdminResponse admin) {
        this.admin = admin;
    }
}