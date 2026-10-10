import React from "react";
import { Zap } from "lucide-react";

const Loading = ({ message = "Loading data...", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px"
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "var(--dark)",
            color: "var(--primary-yellow)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 25px rgba(250, 204, 21, 0.4)",
            animation: "pulse-yellow 1.5s infinite ease-in-out"
          }}
        >
          <Zap size={32} className="spin" />
        </div>
        <p style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-muted)" }}>
          {message}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 0" }}>
      <Zap size={20} className="spin" color="var(--primary-yellow-dark)" />
      <span style={{ fontSize: "0.9rem", fontWeight: "500", color: "var(--text-muted)" }}>
        {message}
      </span>
    </div>
  );
};

export default Loading;
