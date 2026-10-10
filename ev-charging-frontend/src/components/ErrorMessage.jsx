import React from "react";
import { AlertCircle, X } from "lucide-react";

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      className="animate-fade-in"
      style={{
        backgroundColor: "var(--danger-bg)",
        border: "1px solid #FCA5A5",
        borderRadius: "var(--radius-md)",
        padding: "14px 16px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        color: "#991B1B"
      }}
    >
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
      <div style={{ flex: 1, fontSize: "0.9rem", fontWeight: "500", lineHeight: 1.4 }}>
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ color: "#991B1B", padding: "2px", opacity: 0.8 }}
          aria-label="Close error message"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
