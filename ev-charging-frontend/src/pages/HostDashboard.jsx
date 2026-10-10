import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap, MapPin, Cpu, DollarSign, Activity, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import { stationService } from "../services/stationService";
import { chargingPortService } from "../services/chargingPortService";
import { bookingService } from "../services/bookingService";
import { chargingSessionService } from "../services/chargingSessionService";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import StatusBadge from "../components/StatusBadge";
import StationCard from "../components/StationCard";
import { formatCurrency } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";

const HostDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stations, setStations] = useState([]);
  const [ports, setPorts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchHostData();
  }, []);

  const fetchHostData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stRes, bkRes, csRes] = await Promise.allSettled([
        stationService.getMyStation().then((station) => [station]),
        bookingService.getForHost(),
        chargingSessionService.getForHost()
      ]);

      const stList = stRes.status === "fulfilled" && Array.isArray(stRes.value) ? stRes.value : [];
      const bkList = bkRes.status === "fulfilled" && Array.isArray(bkRes.value) ? bkRes.value : [];
      const csList = csRes.status === "fulfilled" && Array.isArray(csRes.value) ? csRes.value : [];

      setStations(stList);
      setBookings(bkList);
      setSessions(csList);

      // Fetch ports for all stations
      if (stList.length > 0) {
        const portPromises = stList.map((s) => chargingPortService.getByStation(s.id).catch(() => []));
        const portResults = await Promise.all(portPromises);
        const allPorts = portResults.flat().filter(Boolean);
        setPorts(allPorts);
      }
    } catch (err) {
      setError("Failed to load station host dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading Host Management Portal..." />;

  const availablePortsCount = ports.filter((p) => p.status === "AVAILABLE").length;
  const occupiedPortsCount = ports.filter((p) => p.status === "CHARGING" || p.status === "OCCUPIED" || p.status === "RESERVED").length;
  const faultedPortsCount = ports.filter((p) => p.status === "OUT_OF_SERVICE" || p.status === "FAULTED").length;

  const totalRevenue = sessions.reduce((sum, s) => sum + (s.cost || 0), 0);
  const totalEnergyDelivered = sessions.reduce((sum, s) => sum + (s.energyConsumedKwh || 0), 0);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0B1120 0%, #1E293B 100%)",
          borderRadius: "var(--radius-xl)",
          padding: "28px 32px",
          color: "var(--white)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px"
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(250, 204, 21, 0.15)",
              color: "var(--primary-yellow)",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: "700",
              marginBottom: "12px",
              border: "1px solid rgba(250, 204, 21, 0.3)"
            }}
          >
            <Zap size={14} /> STATION HOST CONSOLE
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--white)" }}>
            Welcome, {user?.name || "Host"}!
          </h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem", marginTop: "4px" }}>
            Monitor charging infrastructure performance, ports availability, and revenue streams.
          </p>
        </div>

      </div>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      {/* Host KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="stat-label">MY STATIONS</span>
              <div className="stat-value">{stations.length}</div>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "var(--dark)",
                color: "var(--primary-yellow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <MapPin size={24} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px", display: "block" }}>
            Active EV Charging Hubs
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="stat-label">TOTAL PORTS</span>
              <div className="stat-value">{ports.length}</div>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "var(--dark)",
                color: "var(--primary-yellow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Cpu size={24} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", fontSize: "0.75rem", marginTop: "8px" }}>
            <span style={{ color: "var(--success)", fontWeight: "600" }}>{availablePortsCount} Available</span>
            <span>•</span>
            <span style={{ color: "var(--primary-yellow-dark)", fontWeight: "600" }}>{occupiedPortsCount} Occupied</span>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="stat-label">ENERGY DELIVERED</span>
              <div className="stat-value">{totalEnergyDelivered.toFixed(1)} <span style={{ fontSize: "1rem" }}>kWh</span></div>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "var(--dark)",
                color: "var(--primary-yellow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Activity size={24} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: "600", marginTop: "8px", display: "block" }}>
            ⚡ Clean Power Distributed
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="stat-label">TOTAL REVENUE</span>
              <div className="stat-value">{formatCurrency(totalRevenue)}</div>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "var(--dark)",
                color: "var(--primary-yellow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <DollarSign size={24} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px", display: "block" }}>
            Generated from sessions
          </span>
        </div>
      </div>

      {/* Managed Stations Grid */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--dark)" }}>
            Managed Charging Hubs
          </h2>
          <Link to="/host/stations" style={{ color: "var(--primary-yellow-dark)", fontWeight: "600", fontSize: "0.875rem" }}>
            Manage All Stations →
          </Link>
        </div>

        {stations.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <MapPin size={40} color="var(--text-muted)" style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "1.1rem" }}>No stations registered yet</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "4px" }}>
              No station is assigned to this account yet. Contact an administrator to submit or assign one.
            </p>
          </div>
        ) : (
          <div className="grid grid-3">
            {stations.map((st) => (
              <StationCard key={st.id} station={st} />
            ))}
          </div>
        )}
      </div>

      {/* Port Availability Breakdown & Recent Bookings */}
      <div className="grid grid-2">
        {/* Ports Summary */}
        <div className="card">
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={18} color="var(--primary-yellow-dark)" /> Charging Port Breakdown
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} color="var(--success)" />
                <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>Available Ports</span>
              </div>
              <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--success)" }}>{availablePortsCount}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={18} color="var(--primary-yellow-dark)" />
                <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>Occupied / Charging Ports</span>
              </div>
              <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--dark)" }}>{occupiedPortsCount}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="var(--danger)" />
                <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>Faulted / Out of Service</span>
              </div>
              <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--danger)" }}>{faultedPortsCount}</span>
            </div>
          </div>
        </div>

        {/* Recent Station Bookings */}
        <div className="card">
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px" }}>
            Recent Hub Reservations
          </h3>
          {bookings.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No active bookings logged for your stations.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {bookings.slice(0, 4).map((bk) => (
                <div key={bk.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid var(--border-color)" }}>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--dark)" }}>
                      Booking #{bk.id.substring(bk.id.length - 6)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Port ID: {bk.portId ? bk.portId.substring(bk.portId.length - 6) : "N/A"}
                    </div>
                  </div>
                  <StatusBadge status={bk.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
