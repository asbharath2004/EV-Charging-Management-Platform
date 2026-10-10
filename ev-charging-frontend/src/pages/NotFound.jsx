import React from "react";
import { Link } from "react-router-dom";
import { Zap, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px"
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          backgroundColor: "#FEF08A",
          color: "var(--dark)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px"
        }}
      >
        <Zap size={36} />
      </div>

      <h1 style={{ fontSize: "3rem", fontWeight: "800", color: "var(--dark)" }}>404</h1>
      <h2 style={{ fontSize: "1.3rem", color: "var(--text-main)", marginBottom: "8px" }}>
        Page Not Found
      </h2>
      <p style={{ color: "var(--text-muted)", maxWidth: "420px", marginBottom: "24px" }}>
        The EV route or resource you are looking for does not exist or has been moved.
      </p>

      <Link to="/dashboard" className="btn btn-primary">
        <Home size={18} /> Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
