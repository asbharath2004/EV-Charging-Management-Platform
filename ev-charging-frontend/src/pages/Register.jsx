import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, User, Mail, Phone, Lock, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "USER",
    stationName: "",
    stationAddress: "",
    stationLatitude: "",
    stationLongitude: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Full Name is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setError("Please provide a valid email address");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.role === "STATION_HOST" && (!formData.stationName.trim() || !formData.stationAddress.trim() || !formData.stationLatitude || !formData.stationLongitude)) {
      setError("Station name, address, latitude, and longitude are required for Station Host registration");
      return;
    }

    setLoading(true);
    try {
      const createdUser = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        stationName: formData.stationName,
        stationAddress: formData.stationAddress,
        stationLatitude: formData.stationLatitude ? Number(formData.stationLatitude) : null,
        stationLongitude: formData.stationLongitude ? Number(formData.stationLongitude) : null
      });

      // Redirect based on role
      switch (createdUser.role) {
        case "STATION_HOST":
          navigate("/host/station-approval");
          break;
        case "FLEET_OPERATOR":
          navigate("/fleet/dashboard");
          break;
        default:
          navigate("/dashboard");
          break;
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--darker)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: "var(--white)",
          borderRadius: "var(--radius-xl)",
          padding: "36px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              backgroundColor: "var(--primary-yellow)",
              color: "var(--dark)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "10px",
              boxShadow: "var(--shadow-yellow)"
            }}
          >
            <Zap size={30} fill="var(--dark)" strokeWidth={2.5} />
          </div>

          {formData.role === "STATION_HOST" && (
            <div className="card" style={{ padding: "16px", marginBottom: "16px", backgroundColor: "#FEF9C3" }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>Station Details</h3>
              <div className="form-group"><label className="form-label">Station Name *</label><input className="form-input" value={formData.stationName} onChange={(e) => setFormData({ ...formData, stationName: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Station Address *</label><input className="form-input" value={formData.stationAddress} onChange={(e) => setFormData({ ...formData, stationAddress: e.target.value })} required /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group"><label className="form-label">Latitude *</label><input type="number" step="any" className="form-input" value={formData.stationLatitude} onChange={(e) => setFormData({ ...formData, stationLatitude: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Longitude *</label><input type="number" step="any" className="form-input" value={formData.stationLongitude} onChange={(e) => setFormData({ ...formData, stationLongitude: e.target.value })} required /></div>
              </div>
            </div>
          )}
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--dark)" }}>
            Create EV Account
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Join the smart electric mobility ecosystem
          </p>
        </div>

        <ErrorMessage message={error} onClose={() => setError(null)} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {[
                { id: "USER", label: "EV Driver" },
                { id: "STATION_HOST", label: "Station Host" },
                { id: "FLEET_OPERATOR", label: "Fleet Operator" }
              ].map((roleOpt) => (
                <button
                  key={roleOpt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: roleOpt.id })}
                  style={{
                    padding: "8px 6px",
                    borderRadius: "var(--radius-md)",
                    border: formData.role === roleOpt.id ? "2px solid var(--primary-yellow-dark)" : "1px solid var(--border-color)",
                    backgroundColor: formData.role === roleOpt.id ? "#FEF9C3" : "var(--white)",
                    fontWeight: formData.role === roleOpt.id ? "700" : "500",
                    fontSize: "0.8rem",
                    color: "var(--dark)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {roleOpt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Bharath"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="bharath@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "16px" }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create EV Account"} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary-yellow-dark)", fontWeight: "700" }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
