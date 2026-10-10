import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BatteryCharging, CheckCircle2, CreditCard, Power, RefreshCw, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { chargingSessionService } from "../services/chargingSessionService";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { getErrorMessage } from "../services/api";

const ChargingSessions = () => {
  const { userId, role } = useAuth();
  const navigate = useNavigate();
  const isHost = role === "STATION_HOST";
  const isFleet = role === "FLEET_OPERATOR";
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("ACTIVE");
  const [endingSession, setEndingSession] = useState(null);
  const [energyInput, setEnergyInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (isHost) {
        data = await chargingSessionService.getForHost();
      } else if (isFleet) {
        data = await chargingSessionService.getForFleet();
      } else {
        data = await chargingSessionService.getByUser(userId);
      }
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, [userId, isHost, isFleet]);

  const requestEnd = async (session) => {
    setSubmitting(true);
    setError(null);
    try {
      await chargingSessionService.requestEnd(session.id);
      setSessions((current) => current.map((item) => item.id === session.id ? { ...item, status: "END_REQUESTED" } : item));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const finalizeSession = async (event) => {
    event.preventDefault();
    if (!endingSession || Number(energyInput) <= 0) return;
    setSubmitting(true);
    try {
      await chargingSessionService.endSessionAsHost(endingSession.id, energyInput);
      setEndingSession(null);
      setEnergyInput("");
      await fetchSessions();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const activeSessions = sessions.filter((session) => ["IN_PROGRESS", "ACTIVE", "CHARGING", "END_REQUESTED"].includes(session.status));
  const completedSessions = sessions.filter((session) => session.status === "COMPLETED");

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem" }}>{isHost ? "Station Charging Sessions" : "EV Charging Sessions"}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{isHost ? "Review charging activity and finalize end requests for your stations." : "Monitor real-time energy flow, session timers, and billing."}</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchSessions} title="Refresh sessions"><RefreshCw size={16} /> Refresh</button>
      </div>
      <ErrorMessage message={error} onClose={() => setError(null)} />
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
        <button className={tab === "ACTIVE" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setTab("ACTIVE")}><Zap size={16} /> Active Sessions ({activeSessions.length})</button>
        <button className={tab === "COMPLETED" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setTab("COMPLETED")}><CheckCircle2 size={16} /> Completed Sessions ({completedSessions.length})</button>
      </div>
      {loading ? <Loading fullScreen message="Loading charging sessions..." /> : tab === "ACTIVE" ? (
        activeSessions.length === 0 ? <EmptyState icon={BatteryCharging} title="No Active Charging Sessions" description={isHost ? "There are no active sessions for your stations." : "You have no EV charging sessions currently in progress."} actionText={isHost ? undefined : "Book & Start Charging"} onAction={isHost ? undefined : () => navigate("/bookings")} /> :
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {activeSessions.map((session) => (
              <div key={session.id} className="card" style={{ border: "2px solid var(--primary-yellow)", padding: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <Zap size={32} color="var(--primary-yellow-dark)" />
                    <div><h2 style={{ fontSize: "1.35rem" }}>Charging Now</h2><StatusBadge status={session.status === "END_REQUESTED" ? "END_REQUESTED" : "IN_PROGRESS"} /><p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "6px" }}>Started: {formatDateTime(session.actualStartTime || session.createdAt)}</p></div>
                  </div>
                  {isHost && session.status === "END_REQUESTED" ? <button className="btn btn-danger btn-lg" onClick={() => setEndingSession(session)}><Power size={18} /> End Session</button> : !isHost && session.status !== "END_REQUESTED" ? <button className="btn btn-primary btn-lg" onClick={() => requestEnd(session)} disabled={submitting}><Power size={18} /> {submitting ? "Sending Request..." : "Request to End Charging"}</button> : <strong style={{ color: "var(--text-muted)" }}>Waiting for Station Host</strong>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                  <div><span className="stat-label">ENERGY CONSUMED</span><strong>{session.energyConsumedKwh != null ? `${Number(session.energyConsumedKwh).toFixed(1)} kWh` : "Not finalized"}</strong></div>
                  <div><span className="stat-label">BOOKING ID</span><strong>#{session.bookingId?.slice(-6).toUpperCase() || "N/A"}</strong></div>
                  <div><span className="stat-label">PORT ID</span><strong>Port #{session.portId?.slice(-4) || "1"}</strong></div>
                </div>
              </div>
            ))}
          </div>
      ) : completedSessions.length === 0 ? <EmptyState icon={CheckCircle2} title="No Completed Charging Sessions" description="You have no completed charging session records." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {completedSessions.map((session) => {
            const paymentPending = session.paymentStatus !== "SUCCESS";
            return <div key={session.id} className="card"><div style={{ display: "flex", justifyContent: "space-between" }}><strong>Session #{session.id?.slice(-6).toUpperCase()}</strong><StatusBadge status="COMPLETED" /></div><p>Station: {session.stationId || "N/A"}</p><p>Port: {session.portId || "N/A"}</p><p>Energy: {session.energyConsumedKwh != null ? `${Number(session.energyConsumedKwh).toFixed(1)} kWh` : "N/A"}</p><p>Amount: {formatCurrency(session.cost)}</p><p>Start: {formatDateTime(session.actualStartTime)}</p><p>End: {formatDateTime(session.actualEndTime)}</p><p>Payment: <strong>{paymentPending ? "PAYMENT PENDING" : "SUCCESS"}</strong></p>{paymentPending && <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => navigate(`/payments?sessionId=${session.id}&cost=${session.cost || 0}`)}><CreditCard size={14} /> Pay Now</button>}</div>;
          })}
        </div>
      )}
      {isHost && endingSession && <div className="modal-overlay"><div className="modal-content" style={{ maxWidth: "460px" }}><h2>End Charging Session</h2><p>Enter the actual energy consumed to finalize billing.</p><form onSubmit={finalizeSession}><div className="form-group"><label className="form-label">Energy Consumed (kWh) *</label><input type="number" step="0.1" min="0.1" className="form-input" value={energyInput} onChange={(event) => setEnergyInput(event.target.value)} required /></div><div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}><button type="button" className="btn btn-secondary" onClick={() => setEndingSession(null)}>Cancel</button><button type="submit" className="btn btn-danger" disabled={submitting}>{submitting ? "Processing..." : "End & Finalize Session"}</button></div></form></div></div>}
    </div>
  );
};

export default ChargingSessions;
