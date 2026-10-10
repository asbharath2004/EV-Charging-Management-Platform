import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Zap, ArrowRight, Navigation } from "lucide-react";
import StatusBadge from "./StatusBadge";

const StationCard = ({ station, onBook }) => {
  if (!station) return null;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Charging Hub
            </span>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginTop: "2px", color: "var(--dark)" }}>
              {station.name || "EV Charging Station"}
            </h3>
          </div>
          <StatusBadge status={station.status || "AVAILABLE"} />
        </div>

        {station.approvalStatus && (
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px" }}>
            Approval: <strong>{station.approvalStatus}</strong>
            {station.rejectionReason ? ` - ${station.rejectionReason}` : ""}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "12px" }}>
          <MapPin size={16} color="var(--primary-yellow-dark)" style={{ flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {station.address || "Location not provided"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            backgroundColor: "#F8FAFC",
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "16px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Navigation size={13} color="var(--text-light)" />
            <span>Lat: {station.latitude ? Number(station.latitude).toFixed(4) : "N/A"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Navigation size={13} color="var(--text-light)" />
            <span>Long: {station.longitude ? Number(station.longitude).toFixed(4) : "N/A"}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "14px", marginTop: "8px" }}>
        <Link to={`/stations/${station.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
          View Details
        </Link>
        {onBook && station.status === "AVAILABLE" && (
          <button className="btn btn-primary btn-sm" onClick={() => onBook(station)} style={{ flex: 1 }}>
            <Zap size={14} />
            Book Port
          </button>
        )}
      </div>
    </div>
  );
};

export default StationCard;
