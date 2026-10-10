package com.evcharging.ev_charging_backend.dto;

import jakarta.validation.constraints.NotNull;

public class StationApprovalRequest {

    @NotNull(message = "Approval status is required")
    private String approvalStatus;

    private String rejectionReason;

    public StationApprovalRequest() {
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}