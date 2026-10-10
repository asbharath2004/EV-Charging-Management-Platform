import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Truck, BatteryCharging, Zap, DollarSign, Calendar, Activity, ShieldCheck, Plus } from "lucide-react";
import { vehicleService } from "../services/vehicleService";
import { bookingService } from "../services/bookingService";
import { chargingSessionService } from "../services/chargingSessionService";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import VehicleCard from "../components/VehicleCard";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";

const FleetDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchFleetData();
  }, []);

  const fetchFleetData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vehRes, bkRes, csRes] = await Promise.allSettled([
        vehicleService.getAll(),
        bookingService.getForFleet(),
        chargingSessionService.getForFleet()
      ]);

      const vList = vehRes.status === "fulfilled" && Array.isArray(vehRes.value) ? vehRes.value : [];
      const bList = bkRes.status === "fulfilled" && Array.isArray(bkRes.value) ? bkRes.value : [];
      const sList = csRes.status === "fulfilled" && Array.isArray(csRes.value) ? csRes.value : [];

      setVehicles(vList);
      setBookings(bList);
      setSessions(sList);
    } catch (err) {
      setError("Failed to fetch fleet operator metrics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading Fleet Management Operations..." />;

  const activeVehicles = vehicles.filter((v) => (v.currentBatteryPercentage || 0) > 20).length;
  const chargingVehicles = sessions.filter((s) => s.status === "IN_PROGRESS").length;
  const totalFleetEnergy = sessions.reduce((sum, s) => sum + (s.energyConsumedKwh || 0), 0);
  const totalFleetCost = sessions.reduce((sum, s) => sum + (s.cost || 0), 0);

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
            <Truck size={14} /> FLEET OPERATOR CONSOLE
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--white)" }}>
            Welcome, {user?.name || "Operator"}!
          </h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem", marginTop: "4px" }}>
            Real-time telemetry, fleet battery health, reservations, and energy consumption logs.
          </p>
        </div>

        <Link to="/vehicles" className="btn btn-primary btn-lg">
          <Plus size={18} /> Register Fleet EV
        </Link>
      </div>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      {/* Fleet KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="stat-label">FLEET VEHICLES</span>
              <div className="stat-value">{vehicles.length}</div>
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
              <Truck size={24} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: "600", marginTop: "8px", display: "block" }}>
            {activeVehicles} Operational ({vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0}% Active)
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="stat-label">CHARGING NOW</span>
              <div className="stat-value">{chargingVehicles}</div>
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
              <BatteryCharging size={24} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px", display: "block" }}>
            Live High-Power Charging
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="stat-label">FLEET ENERGY</span>
              <div className="stat-value">{totalFleetEnergy.toFixed(1)} <span style={{ fontSize: "1rem" }}>kWh</span></div>
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
              <Zap size={24} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px", display: "block" }}>
            Total Energy Consumed
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="stat-label">CHARGING COSTS</span>
              <div className="stat-value">{formatCurrency(totalFleetCost)}</div>
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
            Total Fleet Expense
          </span>
        </div>
      </div>

      {/* Fleet Vehicles Grid */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--dark)" }}>
            Commercial Fleet Inventory
          </h2>
          <Link to="/vehicles" style={{ color: "var(--primary-yellow-dark)", fontWeight: "600", fontSize: "0.875rem" }}>
            Manage Fleet Vehicles →
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <Truck size={40} color="var(--text-muted)" style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "1.1rem" }}>No fleet vehicles added</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "4px" }}>
              Add electric commercial vehicles to your fleet list.
            </p>
            <Link to="/vehicles" className="btn btn-primary" style={{ marginTop: "16px" }}>
              <Plus size={16} /> Register Fleet EV
            </Link>
          </div>
        ) : (
          <div className="grid grid-3">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FleetDashboard;
