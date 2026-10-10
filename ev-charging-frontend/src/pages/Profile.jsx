import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Save, CheckCircle2, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../services/api";

const Profile = () => {
  const { user, userId, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "Bharath",
    email: user?.email || "bharath@example.com",
    phone: user?.phone || "9876543210"
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
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

    setSubmitting(true);
    try {
      const updated = await userService.update(userId, formData);
      updateUser(updated || formData);
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "680px", margin: "0 auto" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem" }}>User Profile & Settings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Manage your account details and contact information.
        </p>
      </div>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      {successMessage && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: "var(--success-bg)",
            border: "1px solid #86EFAC",
            borderRadius: "var(--radius-md)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#15803D",
            fontSize: "0.9rem",
            fontWeight: "600"
          }}
        >
          <CheckCircle2 size={18} />
          {successMessage}
        </div>
      )}

      {/* Profile Card */}
      <div className="card" style={{ padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px", borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-yellow)",
              color: "var(--dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "800",
              boxShadow: "var(--shadow-yellow)"
            }}
          >
            {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div>
            <h2 style={{ fontSize: "1.4rem", color: "var(--dark)" }}>
              {formData.name || "EV User"}
            </h2>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
              User ID: {userId}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#F1F5F9", padding: "2px 8px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "600", marginTop: "6px", color: "var(--text-main)" }}>
              <Shield size={12} color="var(--success)" /> Verified Mobility Account
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={16} color="var(--primary-yellow-dark)" /> Full Name *
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Bharath"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={16} color="var(--primary-yellow-dark)" /> Email Address *
              </span>
            </label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. bharath@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Phone size={16} color="var(--primary-yellow-dark)" /> Phone Number *
              </span>
            </label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "28px" }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              <Save size={18} />
              {submitting ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
