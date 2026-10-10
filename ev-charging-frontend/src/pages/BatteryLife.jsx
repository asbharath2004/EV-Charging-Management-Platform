import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BatteryCharging,
  BatteryFull,
  Gauge,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { batteryLifeService } from "../services/batteryLifeService";
import { chargingSessionService } from "../services/chargingSessionService";
import { vehicleService } from "../services/vehicleService";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import { formatDate, getBatteryColorHex } from "../utils/formatters";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getHealthStatus = (score) => {
  if (score >= 90) return { label: "Excellent", color: "#22C55E" };
  if (score >= 80) return { label: "Good", color: "#16A34A" };
  if (score >= 70) return { label: "Fair", color: "#F59E0B" };
  return { label: "Needs Attention", color: "#EF4444" };
};

const getChargeType = (session) => {
  const type = (session?.chargingType || session?.type || session?.sessionType || session?.mode || "NORMAL").toString().toUpperCase();
  if (type.includes("FAST") || type.includes("DC") || type.includes("RAPID")) {
    return "FAST";
  }
  return "NORMAL";
};

const getSessionDurationMinutes = (session) => {
  const explicitMinutes = Number(session?.durationMinutes ?? session?.duration ?? session?.chargingDurationMinutes);
  if (Number.isFinite(explicitMinutes) && explicitMinutes >= 0) return explicitMinutes;

  const start = session?.actualStartTime || session?.startTime || session?.createdAt;
  const end = session?.actualEndTime || session?.endTime || session?.completedAt;
  if (!start || !end) return 0;

  const diffMs = new Date(end) - new Date(start);
  if (Number.isNaN(diffMs) || diffMs < 0) return 0;
  return Math.round(diffMs / 60000);
};

const getNumericValue = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") {
      const normalized = Number(value);
      if (Number.isFinite(normalized)) return normalized;
    }
  }
  return null;
};

const getBatteryHealthHistory = (vehicle) => {
  if (!vehicle) return [];

  const rawHistory = Array.isArray(vehicle.batteryHealthHistory)
    ? vehicle.batteryHealthHistory
    : Array.isArray(vehicle.batteryHistory)
      ? vehicle.batteryHistory
      : [];

  return rawHistory
    .map((entry) => ({
      label: entry.label || entry.month || entry.period || entry.date || "Historical",
      value: Number(entry.value ?? entry.health ?? entry.percentage ?? entry.score ?? 0)
    }))
    .filter((entry) => Number.isFinite(entry.value));
};

const BatteryHealthChart = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="card" style={{ padding: "18px 20px", background: "#F8FAFC" }}>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.92rem" }}>
          Battery health trend data is not available yet. When the backend exposes battery health telemetry, this chart will display the trend automatically.
        </p>
      </div>
    );
  }

  const values = history.map((point) => point.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 100);
  const width = 620;
  const height = 220;
  const paddingX = 34;
  const paddingY = 24;

  const points = values
    .map((value, index) => {
      const x = paddingX + (index * (width - paddingX * 2)) / Math.max(values.length - 1, 1);
      const y = height - paddingY - ((value - min) / Math.max(max - min || 1, 1)) * (height - paddingY * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="190" role="img" aria-label="Battery health trend chart" style={{ display: "block" }}>
        {[0, 1, 2, 3].map((step) => {
          const y = paddingY + ((height - paddingY * 2) / 3) * step;
          return <line key={step} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#E2E8F0" strokeDasharray="5 5" />;
        })}
        <polyline points={points} fill="none" stroke="#FACC15" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {values.map((value, index) => {
          const x = paddingX + (index * (width - paddingX * 2)) / Math.max(values.length - 1, 1);
          const y = height - paddingY - ((value - min) / Math.max(max - min || 1, 1)) * (height - paddingY * 2);
          return <g key={`${value}-${index}`}>
            <circle cx={x} cy={y} r="4" fill="#FACC15" />
            <text x={x} y={height - 8} textAnchor="middle" fill="#475569" fontSize="10">{history[index].label}</text>
          </g>;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "6px", color: "var(--text-muted)", fontSize: "0.78rem" }}>
        {history.map((point) => (
          <span key={`${point.label}-${point.value}`} style={{ minWidth: 0, textAlign: "center" }}>{point.label}</span>
        ))}
      </div>
    </div>
  );
};

const BatteryLife = () => {
  const { userId } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [batterySummary, setBatterySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatteryData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [sessionsResponse, vehiclesResponse, batterySummaryResponse] = await Promise.allSettled([
          chargingSessionService.getByUser(userId),
          vehicleService.getByUser(userId),
          batteryLifeService.getByUser(userId)
        ]);

        const sessionData = sessionsResponse.status === "fulfilled" && Array.isArray(sessionsResponse.value) ? sessionsResponse.value : [];
        const vehicleData = vehiclesResponse.status === "fulfilled" && Array.isArray(vehiclesResponse.value) ? vehiclesResponse.value : [];
        const summaryData = batterySummaryResponse.status === "fulfilled" ? batterySummaryResponse.value : null;

        setSessions(sessionData);
        setVehicles(vehicleData);
        setBatterySummary(summaryData);
      } catch (err) {
        console.error("Battery life fetch error:", err);
        setError("Unable to load battery telemetry right now. The page will still show safe, data-driven recommendations from any available session history.");
      } finally {
        setLoading(false);
      }
    };

    fetchBatteryData();
  }, [userId]);

  const primaryVehicle = useMemo(() => {
    if (vehicles.length === 0) return null;
    return vehicles[0];
  }, [vehicles]);

  const latestSession = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => new Date(b.actualEndTime || b.actualStartTime || b.createdAt || 0) - new Date(a.actualEndTime || a.actualStartTime || a.createdAt || 0));
    return sorted[0] || null;
  }, [sessions]);

  const hasTelemetry = sessions.length > 0 || (primaryVehicle && (
    getNumericValue(primaryVehicle, ["currentBatteryPercentage", "batteryPercentage", "soc"]) !== null ||
    getNumericValue(primaryVehicle, ["batteryHealth", "healthPercentage", "healthScore"]) !== null ||
    getNumericValue(primaryVehicle, ["batteryCapacity", "batteryCapacityKwh", "capacityKwh"]) !== null
  ));

  const currentSoc = batterySummary?.currentBatterySoc ?? (hasTelemetry ? clamp(
    getNumericValue(primaryVehicle, ["currentBatteryPercentage", "batteryPercentage", "soc"]) ??
    getNumericValue(latestSession, ["endSoc", "endBatteryPercentage", "currentSoc", "batteryPercentage"]) ??
    68,
    0,
    100
  ) : null);

  const estimatedRangeKm = batterySummary?.estimatedRangeKm ?? (currentSoc === null ? null : (() => {
    const baseRange = Number(primaryVehicle?.estimatedRangeKm ?? primaryVehicle?.rangeKm ?? primaryVehicle?.batteryRangeKm ?? 350);
    if (Number.isFinite(baseRange) && baseRange > 0) {
      return Math.round((currentSoc / 100) * baseRange);
    }
    return Math.round((currentSoc / 100) * 400);
  })());

  const batteryHealthRaw = useMemo(() => {
    const serverHealth = batterySummary?.batteryHealthPercent;
    if (serverHealth !== undefined && serverHealth !== null) return clamp(Number(serverHealth), 0, 100);
    const healthFromVehicle = getNumericValue(primaryVehicle, ["batteryHealth", "healthPercentage", "healthScore"]);
    if (Number.isFinite(healthFromVehicle)) return clamp(healthFromVehicle, 0, 100);

    if (sessions.length === 0) return null;

    const fastChargeCount = sessions.filter((session) => getChargeType(session) === "FAST").length;
    const highSocCount = sessions.filter((session) => {
      const endSoc = getNumericValue(session, ["endSoc", "endBatteryPercentage", "batteryLevelAfterCharging", "socAfterCharging"]);
      return Number.isFinite(endSoc) && endSoc > 90;
    }).length;
    const deepDischargeCount = sessions.filter((session) => {
      const startSoc = getNumericValue(session, ["startSoc", "startBatteryPercentage", "socBeforeCharging"]) ?? 100;
      return Number.isFinite(startSoc) && startSoc < 20;
    }).length;

    const derivedHealth = 100 - (fastChargeCount * 2.5) - (highSocCount * 1.8) - (deepDischargeCount * 4.5);
    return clamp(derivedHealth, 60, 100);
  }, [batterySummary, primaryVehicle, sessions]);

  const batteryHealthStatus = batteryHealthRaw === null ? { label: "Awaiting telemetry", color: "#94A3B8" } : getHealthStatus(batteryHealthRaw);
  const batteryLifeScore = batterySummary?.batteryLifeScore ?? (batteryHealthRaw === null ? null : clamp(Math.round(batteryHealthRaw - sessions.filter((session) => getChargeType(session) === "FAST").length * 1.5 - sessions.filter((session) => {
    const endSoc = getNumericValue(session, ["endSoc", "endBatteryPercentage", "socAfterCharging"]) ?? 0;
    return Number.isFinite(endSoc) && endSoc >= 90;
  }).length * 2.5), 0, 100));

  const batteryLifeStatus = batteryLifeScore === null ? { label: "Awaiting telemetry", color: "#94A3B8" } : getHealthStatus(batteryLifeScore);

  const sessionStats = useMemo(() => {
    const totalSessions = sessions.length;
    const normalSessions = sessions.filter((session) => getChargeType(session) === "NORMAL").length;
    const fastSessions = sessions.filter((session) => getChargeType(session) === "FAST").length;
    const totalEnergyConsumed = sessions.reduce((total, session) => {
      const energy = getNumericValue(session, ["energyConsumedKwh", "energyKwh", "energyConsumed", "consumedKwh" ]);
      return total + (Number.isFinite(energy) ? energy : 0);
    }, 0);
    const avgEnergyPerSession = totalSessions > 0 ? totalEnergyConsumed / totalSessions : 0;
    const avgDurationMinutes = totalSessions > 0
      ? sessions.reduce((total, session) => total + getSessionDurationMinutes(session), 0) / totalSessions
      : 0;
    const deepDischargeEvents = sessions.filter((session) => {
      const startSoc = getNumericValue(session, ["startSoc", "startBatteryPercentage", "socBeforeCharging"]) ?? 100;
      return Number.isFinite(startSoc) && startSoc < 20;
    }).length;

    return {
      totalSessions,
      normalSessions,
      fastSessions,
      totalEnergyConsumed,
      avgEnergyPerSession,
      avgDurationMinutes,
      deepDischargeEvents
    };
  }, [sessions]);

  const recommendationText = useMemo(() => {
    if (batterySummary?.recommendation) {
      return batterySummary.recommendation;
    }

    if (currentSoc === null || batteryHealthRaw === null) {
      return "Battery telemetry is not available yet. Once charging sessions or vehicle telemetry are available, this panel will show a data-backed recommendation.";
    }

    const lines = [];

    if (currentSoc < 20) {
      lines.push("Battery level is low. Consider charging soon.");
    } else if (currentSoc >= 20 && currentSoc <= 80) {
      lines.push("Battery is in the recommended daily operating range.");
    } else {
      lines.push("Battery is highly charged. Avoid keeping the vehicle at high SOC for long periods.");
    }

    if (sessionStats.fastSessions > 0 && sessionStats.fastSessions >= Math.max(1, Math.round(sessionStats.totalSessions * 0.3))) {
      lines.push("Frequent fast charging detected. Normal charging may help reduce battery stress.");
    }

    return lines.join(" ");
  }, [batterySummary, currentSoc, batteryHealthRaw, sessionStats]);

  const insights = useMemo(() => {
    if (Array.isArray(batterySummary?.insights) && batterySummary.insights.length > 0) {
      return batterySummary.insights;
    }

    const items = [];

    if (batteryHealthRaw !== null && batteryHealthRaw >= 90) {
      items.push("Your battery health is excellent.");
    }

    if (sessionStats.fastSessions > 0 && sessionStats.fastSessions >= Math.max(1, Math.round(sessionStats.totalSessions * 0.3))) {
      items.push("You have used fast charging frequently this month.");
    }

    if (sessions.some((session) => {
      const endSoc = getNumericValue(session, ["endSoc", "endBatteryPercentage", "socAfterCharging"]) ?? 0;
      return Number.isFinite(endSoc) && endSoc > 90;
    })) {
      items.push("Your battery is often charged above 90%.");
    }

    if (sessionStats.deepDischargeEvents > 0) {
      items.push("Your battery has experienced deep discharge events.");
    }

    if (items.length === 0) {
      if (batteryHealthRaw === null && !hasTelemetry) {
        items.push("Battery telemetry is not available yet.");
      } else {
        items.push("Your recent charging pattern is healthy.");
      }
    }

    return items;
  }, [batterySummary, batteryHealthRaw, sessionStats, sessions, hasTelemetry]);

  const batteryCapacityKwh = Number(primaryVehicle?.batteryCapacity ?? primaryVehicle?.batteryCapacityKwh ?? primaryVehicle?.capacityKwh ?? 0);
  const estimatedCapacityKwh = batterySummary?.estimatedCapacityKwh ?? (batteryCapacityKwh > 0 ? batteryCapacityKwh * ((batteryHealthRaw ?? 0) / 100) : 0);
  const currentUsableCapacityKwh = batterySummary?.currentUsableCapacityKwh ?? (batteryCapacityKwh > 0 && currentSoc !== null ? batteryCapacityKwh * (currentSoc / 100) : 0);
  const healthHistory = getBatteryHealthHistory(primaryVehicle);
  const healthRingValue = batteryHealthRaw === null ? 0 : clamp(Math.round(batteryHealthRaw), 0, 100);
  const healthRingColor = batteryHealthRaw === null ? "#CBD5E1" : batteryHealthStatus.color;

  if (loading) {
    return <Loading fullScreen message="Loading battery life data..." />;
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.9rem" }}>Battery Life</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>Monitor vehicle battery condition, charge behavior, and battery health trends.</p>
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        <div className="stat-card">
          <div>
            <span className="stat-label">Current Charge</span>
            <div style={{ fontSize: "1.8rem", fontWeight: "800" }}>{currentSoc === null ? "--" : `${Math.round(currentSoc)}%`}</div>
            <span style={{ fontSize: "0.8rem", color: currentSoc === null ? "var(--text-muted)" : "var(--success)" }}>{currentSoc === null ? "Awaiting telemetry" : "Battery status tracked"}</span>
          </div>
          <div className="stat-card-icon">
            <BatteryCharging size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span className="stat-label">Estimated Range</span>
            <div style={{ fontSize: "1.8rem", fontWeight: "800" }}>{estimatedRangeKm === null ? "--" : `${estimatedRangeKm} km`}</div>
            <span style={{ fontSize: "0.8rem", color: estimatedRangeKm === null ? "var(--text-muted)" : "var(--info)" }}>{estimatedRangeKm === null ? "Awaiting telemetry" : "Based on current charge"}</span>
          </div>
          <div className="stat-card-icon">
            <Gauge size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span className="stat-label">Battery Health</span>
            <div style={{ fontSize: "1.8rem", fontWeight: "800" }}>{batteryHealthRaw === null ? "--" : `${Math.round(batteryHealthRaw)}%`}</div>
            <span style={{ fontSize: "0.8rem", color: batteryHealthRaw === null ? "#94A3B8" : getBatteryColorHex(batteryHealthRaw) }}>{batteryHealthRaw === null ? "Awaiting telemetry" : batteryHealthStatus.label}</span>
          </div>
          <div className="stat-card-icon">
            <HeartPulse size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span className="stat-label">Battery Life Score</span>
            <div style={{ fontSize: "1.8rem", fontWeight: "800" }}>{batteryLifeScore === null ? "--" : `${batteryLifeScore}/100`}</div>
            <span style={{ fontSize: "0.8rem", color: batteryLifeStatus.color }}>{batteryLifeStatus.label}</span>
          </div>
          <div className="stat-card-icon">
            <Sparkles size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <BatteryFull size={22} color="var(--primary-yellow-dark)" />
            <h2 style={{ fontSize: "1.2rem" }}>Charging Recommendation</h2>
          </div>
          <p style={{ color: "var(--text-main)", fontSize: "1rem", lineHeight: 1.7, margin: 0 }}>{recommendationText}</p>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <ShieldCheck size={22} color="var(--success)" />
            <h2 style={{ fontSize: "1.2rem" }}>Battery Health</h2>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: `conic-gradient(${healthRingColor} ${healthRingValue * 3.6}deg, #E2E8F0 0deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "inset 0 0 0 1px rgba(148, 163, 184, 0.15)"
              }}
            >
              <div style={{ width: "84px", height: "84px", borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", border: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: "800" }}>{batteryHealthRaw === null ? "--" : `${Math.round(batteryHealthRaw)}%`}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{batteryHealthRaw === null ? "N/A" : batteryHealthStatus.label}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <div className="stat-label">Estimated Capacity</div>
              <div style={{ fontWeight: "700" }}>{estimatedCapacityKwh > 0 ? `${estimatedCapacityKwh.toFixed(1)} kWh` : "Not available"}</div>
            </div>
            <div>
              <div className="stat-label">Usable Capacity</div>
              <div style={{ fontWeight: "700" }}>{currentUsableCapacityKwh > 0 ? `${currentUsableCapacityKwh.toFixed(1)} kWh` : "Not available"}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <TrendingUp size={20} color="var(--primary-yellow-dark)" />
              <h2 style={{ fontSize: "1.2rem" }}>Battery Health Trend</h2>
            </div>
          </div>
          <BatteryHealthChart history={healthHistory} />
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Zap size={20} color="var(--warning)" />
            <h2 style={{ fontSize: "1.2rem" }}>Charging Statistics</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
            <div><div className="stat-label">Total Sessions</div><div style={{ fontWeight: "700" }}>{sessionStats.totalSessions}</div></div>
            <div><div className="stat-label">Normal</div><div style={{ fontWeight: "700" }}>{sessionStats.normalSessions}</div></div>
            <div><div className="stat-label">Fast / DC</div><div style={{ fontWeight: "700" }}>{sessionStats.fastSessions}</div></div>
            <div><div className="stat-label">Energy Consumed</div><div style={{ fontWeight: "700" }}>{sessionStats.totalEnergyConsumed.toFixed(1)} kWh</div></div>
            <div><div className="stat-label">Avg / Session</div><div style={{ fontWeight: "700" }}>{sessionStats.avgEnergyPerSession.toFixed(1)} kWh</div></div>
            <div><div className="stat-label">Avg Duration</div><div style={{ fontWeight: "700" }}>{sessionStats.avgDurationMinutes.toFixed(0)} min</div></div>
            <div style={{ gridColumn: "span 2" }}><div className="stat-label">Deep Discharge Events</div><div style={{ fontWeight: "700" }}>{sessionStats.deepDischargeEvents}</div></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <AlertTriangle size={20} color="var(--primary-yellow-dark)" />
          <h2 style={{ fontSize: "1.2rem" }}>Battery Insights</h2>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          {insights.map((insight) => (
            <div key={insight} style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#F8FAFC", borderRadius: "var(--radius-md)", padding: "12px 14px", border: "1px solid var(--border-color)" }}>
              <div style={{ width: "8px", height: "8px", background: "var(--primary-yellow)", borderRadius: "50%", marginTop: "8px" }} />
              <span style={{ color: "var(--text-main)", lineHeight: 1.6 }}>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <BatteryCharging size={20} color="var(--primary-yellow-dark)" />
          <h2 style={{ fontSize: "1.2rem" }}>Charging History</h2>
        </div>

        {sessions.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-muted)" }}>No charging session history is available for this user yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase" }}>Charging Station</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase" }}>Start SOC</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase" }}>End SOC</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase" }}>Energy</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase" }}>Type</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase" }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {[...sessions].slice(0, 8).map((session) => {
                  const startSoc = getNumericValue(session, ["startSoc", "startBatteryPercentage", "socBeforeCharging"]) ?? "N/A";
                  const endSoc = getNumericValue(session, ["endSoc", "endBatteryPercentage", "socAfterCharging"]) ?? "N/A";
                  const energy = getNumericValue(session, ["energyConsumedKwh", "energyKwh", "energyConsumed", "consumedKwh"]) ?? 0;
                  const duration = getSessionDurationMinutes(session);

                  return (
                    <tr key={session.id || `${session.stationId}-${session.createdAt}`} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px 8px" }}>{formatDate(session.actualEndTime || session.actualStartTime || session.createdAt)}</td>
                      <td style={{ padding: "12px 8px" }}>{session.stationName || session.stationId || "Charging Station"}</td>
                      <td style={{ padding: "12px 8px" }}>{startSoc === "N/A" ? "N/A" : `${Math.round(startSoc)}%`}</td>
                      <td style={{ padding: "12px 8px" }}>{endSoc === "N/A" ? "N/A" : `${Math.round(endSoc)}%`}</td>
                      <td style={{ padding: "12px 8px" }}>{Number.isFinite(energy) ? `${energy.toFixed(1)} kWh` : "N/A"}</td>
                      <td style={{ padding: "12px 8px" }}>{getChargeType(session)}</td>
                      <td style={{ padding: "12px 8px" }}>{duration > 0 ? `${duration} min` : "N/A"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatteryLife;
