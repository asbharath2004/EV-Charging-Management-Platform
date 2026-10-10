import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Zap, CheckCircle2, XCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatDateTime } from "../utils/formatters";

const BookingCard = ({ booking, onConfirm, onCancel, onStartCharging }) => {
  if (!booking) return null;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={18} color="var(--primary-yellow-dark)" />
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--dark)" }}>
              Booking #{booking.id ? booking.id.slice(-6).toUpperCase() : "N/A"}
            </span>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div
          style={{
            backgroundColor: "#F8FAFC",
            borderRadius: "var(--radius-md)",
            padding: "12px 14px",
            marginBottom: "14px",
            fontSize: "0.875rem",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)" }}>
            <Clock size={16} color="var(--text-muted)" />
            <div>
              <span style={{ fontWeight: "600" }}>Start:</span> {formatDateTime(booking.startTime)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)" }}>
            <Clock size={16} color="var(--text-muted)" />
            <div>
              <span style={{ fontWeight: "600" }}>End:</span> {formatDateTime(booking.endTime)}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.8125rem", marginBottom: "16px" }}>
          <div style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
            <span style={{ color: "var(--text-muted)", display: "block" }}>Station</span>
            <span style={{ fontWeight: "600", color: "var(--dark)" }}>
              {booking.stationId ? `Station ${booking.stationId.slice(-4)}` : "Hub Station"}
            </span>
          </div>
          <div style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
            <span style={{ color: "var(--text-muted)", display: "block" }}>Port ID</span>
            <span style={{ fontWeight: "600", color: "var(--dark)" }}>
              {booking.portId ? `Port ${booking.portId.slice(-4)}` : "Port 1"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons based on status */}
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {booking.status === "PENDING" && (
          <>
            {onConfirm && (
              <button className="btn btn-primary btn-sm" onClick={() => onConfirm(booking.id)} style={{ flex: 1 }}>
                <CheckCircle2 size={14} />
                Confirm
              </button>
            )}
            {onCancel && (
              <button className="btn btn-secondary btn-sm" onClick={() => onCancel(booking.id)} style={{ flex: 1, color: "var(--danger)" }}>
                <XCircle size={14} />
                Cancel
              </button>
            )}
          </>
        )}

        {booking.status === "CONFIRMED" && onStartCharging && (
          <button className="btn btn-primary btn-sm" onClick={() => onStartCharging(booking.id)} style={{ flex: 1, width: "100%" }}>
            <Zap size={14} />
            Start Charging Session
          </button>
        )}

        <Link to={`/bookings/${booking.id}`} className="btn btn-secondary btn-sm" style={{ width: booking.status === "PENDING" || booking.status === "CONFIRMED" ? "auto" : "100%" }}>
          Details
        </Link>
      </div>
    </div>
  );
};

export default BookingCard;
