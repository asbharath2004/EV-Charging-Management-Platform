import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../services/api";
import { stationService } from "../services/stationService";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      
      // Redirect based on role
      switch (loggedInUser.role) {
        case "STATION_HOST":
          try {
            const station = await stationService.getMyStation();
            navigate(station.approvalStatus === "APPROVED" ? "/host/dashboard" : "/host/station-approval");
          } catch {
            navigate("/host/station-approval");
          }
          break;
        case "FLEET_OPERATOR":
          navigate("/fleet/dashboard");
          break;
        case "ADMIN":
          navigate("/admin/dashboard");
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
          padding: "40px",
          maxWidth: "440px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "var(--primary-yellow)",
              color: "var(--dark)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px",
              boxShadow: "var(--shadow-yellow)"
            }}
          >
            <Zap size={32} fill="var(--dark)" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--dark)" }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Sign in to access your EV Charging account
          </p>
        </div>

        <ErrorMessage message={error} onClose={() => setError(null)} />

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={16} color="var(--primary-yellow-dark)" /> Email Address
              </span>
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. bharath@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Lock size={16} color="var(--primary-yellow-dark)" /> Password
              </span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ paddingRight: "44px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "16px" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary-yellow-dark)", fontWeight: "700" }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
