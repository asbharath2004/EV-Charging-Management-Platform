import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap,
  Car,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  BatteryCharging,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { stationService } from "../services/stationService";
import { vehicleService } from "../services/vehicleService";
import { bookingService } from "../services/bookingService";
import { chargingSessionService } from "../services/chargingSessionService";
import { paymentService } from "../services/paymentService";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency, formatDateTime } from "../utils/formatters";

const Dashboard = () => {
  const { userId, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalStations: 0,
    availableStations: 0,
    activeBookings: 0,
    activeSessions: 0,
    completedSessions: 0,
    totalPayments: 0,
    totalEnergyConsumed: 0,
    totalAmountSpent: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [activeSessionsList, setActiveSessionsList] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel API calls
      const [stations, vehicles, bookings, sessions, payments] = await Promise.allSettled([
        stationService.getAll(),
        vehicleService.getByUser(userId),
        bookingService.getByUser(userId),
        chargingSessionService.getByUser(userId),
        paymentService.getByUser(userId)
      ]);

      const stationData = stations.status === "fulfilled" && Array.isArray(stations.value) ? stations.value : [];
      const vehicleData = vehicles.status === "fulfilled" && Array.isArray(vehicles.value) ? vehicles.value : [];
      const bookingData = bookings.status === "fulfilled" && Array.isArray(bookings.value) ? bookings.value : [];
      const sessionData = sessions.status === "fulfilled" && Array.isArray(sessions.value) ? sessions.value : [];
      const paymentData = payments.status === "fulfilled" && Array.isArray(payments.value) ? payments.value : [];

      // Calculate statistics
      const availStations = stationData.filter((s) => s.status === "AVAILABLE").length;
      const actBookings = bookingData.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED").length;
      const actSessions = sessionData.filter((s) => s.status === "IN_PROGRESS");
      const compSessions = sessionData.filter((s) => s.status === "COMPLETED");

      const totalEnergy = sessionData.reduce((acc, curr) => acc + (Number(curr.energyConsumedKwh) || 0), 0);
      const totalSpent = paymentData.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

      setStats({
        totalVehicles: vehicleData.length,
        totalStations: stationData.length,
        availableStations: availStations,
        activeBookings: actBookings,
        activeSessions: actSessions.length,
        completedSessions: compSessions.length,
        totalPayments: paymentData.length,
        totalEnergyConsumed: totalEnergy,
        totalAmountSpent: totalSpent
      });

      setRecentBookings(bookingData.slice(0, 5));
      setActiveSessionsList(actSessions);
      setRecentPayments(paymentData.slice(0, 5));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load live dashboard statistics. Displaying available data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading EV Charging Dashboard..." />;
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0B1120 0%, #111827 60%, #1E293B 100%)",
          borderRadius: "var(--radius-xl)",
          padding: "28px 32px",
          color: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 25px -5px rgba(11, 17, 32, 0.4)"
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(250, 204, 21, 0.15)", border: "1px solid rgba(250, 204, 21, 0.3)", padding: "4px 12px", borderRadius: "999px", color: "var(--primary-yellow)", fontSize: "0.8rem", fontWeight: "700", marginBottom: "12px" }}>
            <Zap size={14} fill="var(--primary-yellow)" /> REAL-TIME MONITORING
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "800", color: "#FFFFFF", marginBottom: "6px" }}>
            Welcome back, {user?.name || "Bharath"}!
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.95rem", maxWidth: "560px" }}>
            Manage your electric vehicles, locate nearby fast chargers, track live charging sessions, and handle payments seamlessly.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", zIndex: 2 }}>
          <button className="btn btn-primary" onClick={() => navigate("/stations")}>
            <MapPin size={18} />
            Find Charging Station
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/bookings")}>
            <Calendar size={18} />
            Book Slot
          </button>
        </div>

        {/* Subtle background glow element */}
        <div
          style={{
            position: "absolute",
            right: "-40px",
            bottom: "-40px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(250, 204, 21, 0.2) 0%, rgba(250, 204, 21, 0) 70%)"
          }}
        />
      </div>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      {/* Main KPI Stat Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
        {/* Total Energy Consumed */}
        <div className="stat-card">
          <div>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Energy
            </span>
            <div style={{ fontSize: "1.65rem", fontWeight: "800", color: "var(--dark)", marginTop: "4px" }}>
              {stats.totalEnergyConsumed.toFixed(1)} <span style={{ fontSize: "1rem" }}>kWh</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--success)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
              <TrendingUp size={12} /> Clean EV Power
            </span>
          </div>
          <div className="stat-card-icon">
            <Zap size={24} />
          </div>
        </div>

        {/* Vehicles */}
        <div className="stat-card">
          <div>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              My Vehicles
            </span>
            <div style={{ fontSize: "1.65rem", fontWeight: "800", color: "var(--dark)", marginTop: "4px" }}>
              {stats.totalVehicles}
            </div>
            <Link to="/vehicles" style={{ fontSize: "0.75rem", color: "var(--primary-yellow-dark)", fontWeight: "600", marginTop: "4px", display: "inline-block" }}>
              Manage EVs →
            </Link>
          </div>
          <div className="stat-card-icon">
            <Car size={24} />
          </div>
        </div>

        {/* Available Stations */}
        <div className="stat-card">
          <div>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Available Stations
            </span>
            <div style={{ fontSize: "1.65rem", fontWeight: "800", color: "var(--dark)", marginTop: "4px" }}>
              {stats.availableStations} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>/ {stats.totalStations}</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: "600", marginTop: "4px", display: "inline-block" }}>
              Hubs Online
            </span>
          </div>
          <div className="stat-card-icon">
            <MapPin size={24} />
          </div>
        </div>

        {/* Total Spent */}
        <div className="stat-card">
          <div>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Spent
            </span>
            <div style={{ fontSize: "1.65rem", fontWeight: "800", color: "var(--dark)", marginTop: "4px" }}>
              {formatCurrency(stats.totalAmountSpent)}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "inline-block" }}>
              {stats.totalPayments} Payments
            </span>
          </div>
          <div className="stat-card-icon">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--dark)", display: "block", marginBottom: "12px" }}>
          ⚡ Quick Actions
        </span>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/stations")}>
            <MapPin size={16} color="var(--primary-yellow-dark)" /> Find Station
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/bookings")}>
            <Calendar size={16} color="var(--primary-yellow-dark)" /> Book Charging
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/vehicles")}>
            <Car size={16} color="var(--primary-yellow-dark)" /> My Vehicles
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/charging-sessions")}>
            <BatteryCharging size={16} color="var(--primary-yellow-dark)" /> Charging History
          </button>
        </div>
      </div>

      {/* Active Charging Banner (If session IN_PROGRESS) */}
      {activeSessionsList.length > 0 && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: "#FEF9C3",
            border: "2px solid var(--primary-yellow)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "var(--dark)",
                color: "var(--primary-yellow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 15px rgba(250, 204, 21, 0.5)",
                animation: "pulse-yellow 1.5s infinite ease-in-out"
              }}
            >
              <Zap size={24} className="spin" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--dark)" }}>
                  ⚡ Charging Session In Progress
                </h3>
                <StatusBadge status="IN_PROGRESS" />
              </div>
              <p style={{ fontSize: "0.875rem", color: "#854D0E", marginTop: "2px" }}>
                Session #{activeSessionsList[0].id?.slice(-6).toUpperCase()} is active.
              </p>
            </div>
          </div>

          <Link to={`/charging-sessions`} className="btn btn-dark btn-sm">
            View Live Session <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Recent Activity Section Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Recent Bookings */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Recent Bookings</h3>
            <Link to="/bookings" style={{ fontSize: "0.85rem", color: "var(--primary-yellow-dark)", fontWeight: "600" }}>
              View All →
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", padding: "16px 0" }}>
              No recent bookings found.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "#F8FAFC",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "var(--dark)" }}>
                      Booking #{b.id?.slice(-6).toUpperCase()}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {formatDateTime(b.startTime)}
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Recent Payments</h3>
            <Link to="/payments" style={{ fontSize: "0.85rem", color: "var(--primary-yellow-dark)", fontWeight: "600" }}>
              View History →
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", padding: "16px 0" }}>
              No recent payments found.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "#F8FAFC",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "var(--dark)" }}>
                      {formatCurrency(p.amount)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Method: {p.paymentMethod}
                    </div>
                  </div>
                  <StatusBadge status={p.status || "SUCCESS"} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
