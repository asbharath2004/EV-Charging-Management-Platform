import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Zap, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { bookingService } from "../services/bookingService";
import { chargingSessionService } from "../services/chargingSessionService";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { formatDateTime } from "../utils/formatters";
import { getErrorMessage } from "../services/api";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getById(id);
      setBooking(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      const updated = await bookingService.confirm(id);
      setBooking(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(true);
    try {
      const updated = await bookingService.cancel(id);
      setBooking(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartCharging = async () => {
    setActionLoading(true);
    try {
      await chargingSessionService.startSession(id);
      navigate("/charging-sessions");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading booking details..." />;
  }

  if (!booking) {
    return (
      <EmptyState
        title="Booking not found"
        description="The requested reservation record does not exist."
        actionText="Back to Bookings"
        onAction={() => navigate("/bookings")}
      />
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <button
        onClick={() => navigate("/bookings")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.875rem",
          color: "var(--text-muted)",
          fontWeight: "600"
        }}
      >
        <ArrowLeft size={16} /> Back to Bookings
      </button>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      <div className="card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-light)", textTransform: "uppercase" }}>
              Reservation Summary
            </span>
            <h1 style={{ fontSize: "1.5rem" }}>
              Booking #{booking.id ? booking.id.toUpperCase() : "N/A"}
            </h1>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Scheduled Start</span>
            <div style={{ fontWeight: "700", fontSize: "1rem", color: "var(--dark)", marginTop: "4px" }}>
              {formatDateTime(booking.startTime)}
            </div>
          </div>

          <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Scheduled End</span>
            <div style={{ fontWeight: "700", fontSize: "1rem", color: "var(--dark)", marginTop: "4px" }}>
              {formatDateTime(booking.endTime)}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9375rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
            <span style={{ color: "var(--text-muted)" }}>User ID:</span>
            <span style={{ fontWeight: "600", fontFamily: "monospace" }}>{booking.userId}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
            <span style={{ color: "var(--text-muted)" }}>Vehicle ID:</span>
            <span style={{ fontWeight: "600", fontFamily: "monospace" }}>{booking.vehicleId}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
            <span style={{ color: "var(--text-muted)" }}>Station ID:</span>
            <span style={{ fontWeight: "600", fontFamily: "monospace" }}>{booking.stationId}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Port ID:</span>
            <span style={{ fontWeight: "600", fontFamily: "monospace" }}>{booking.portId}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ marginTop: "32px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          {booking.status === "PENDING" && (
            <>
              <button className="btn btn-secondary" onClick={handleCancel} disabled={actionLoading}>
                <XCircle size={18} /> Cancel Booking
              </button>
              <button className="btn btn-primary" onClick={handleConfirm} disabled={actionLoading}>
                <CheckCircle2 size={18} /> Confirm Booking
              </button>
            </>
          )}

          {booking.status === "CONFIRMED" && (
            <button className="btn btn-primary btn-lg" onClick={handleStartCharging} disabled={actionLoading} style={{ width: "100%" }}>
              <Zap size={20} /> Start Charging Session Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
