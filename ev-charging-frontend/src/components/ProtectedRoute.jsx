import React from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user, role } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Authenticating user session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect target based on role
    const getDashboardPath = (userRole) => {
      switch (userRole) {
        case "STATION_HOST":
          return "/host/dashboard";
        case "FLEET_OPERATOR":
          return "/fleet/dashboard";
        case "ADMIN":
          return "/admin/dashboard";
        default:
          return "/dashboard";
      }
    };

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
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#FEE2E2",
            color: "var(--danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px"
          }}
        >
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--dark)" }}>
          Access Denied (403 Forbidden)
        </h2>
        <p style={{ color: "var(--text-muted)", maxWidth: "440px", marginTop: "8px", marginBottom: "24px" }}>
          You do not have permission to access this page. Required role:{" "}
          <strong>{allowedRoles.join(", ")}</strong>. Your role is <strong>{role}</strong>.
        </p>
        <Link to={getDashboardPath(role)} className="btn btn-primary">
          <ArrowLeft size={18} /> Return to Your Dashboard
        </Link>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
