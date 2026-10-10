import React from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: "440px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "20px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: type === "danger" ? "var(--danger-bg)" : "var(--warning-bg)",
              color: type === "danger" ? "var(--danger)" : "var(--warning)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", marginBottom: "6px" }}>{title}</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            className={`btn ${type === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
