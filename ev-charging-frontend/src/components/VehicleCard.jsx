import React from "react";
import { Car, Battery, Zap, Edit2, Trash2 } from "lucide-react";
import { getBatteryColorClass, getBatteryColorHex } from "../utils/formatters";

const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  if (!vehicle) return null;

  const batteryPct = vehicle.currentBatteryPercentage ?? 50;
  const batteryColorClass = getBatteryColorClass(batteryPct);
  const batteryColorHex = getBatteryColorHex(batteryPct);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        {/* Header with car info & action icons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--dark)",
                color: "var(--primary-yellow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Car size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--dark)" }}>
                {vehicle.brand} {vehicle.model}
              </h3>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                {vehicle.registrationNumber}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {onEdit && (
              <button
                onClick={() => onEdit(vehicle)}
                aria-label="Edit Vehicle"
                style={{ padding: "6px", borderRadius: "6px", color: "var(--text-muted)", backgroundColor: "#F1F5F9" }}
              >
                <Edit2 size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(vehicle)}
                aria-label="Delete Vehicle"
                style={{ padding: "6px", borderRadius: "6px", color: "var(--danger)", backgroundColor: "var(--danger-bg)" }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Battery Visual Indicator */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            marginBottom: "14px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
              <Battery size={16} color={batteryColorHex} />
              <span>Battery Charge</span>
            </div>
            <span style={{ fontWeight: "700", color: batteryColorHex }}>{batteryPct}%</span>
          </div>

          <div className="battery-bar-container">
            <div
              className={`battery-bar-fill ${batteryColorClass}`}
              style={{ width: `${Math.min(100, Math.max(0, batteryPct))}%` }}
            />
          </div>
        </div>

        {/* Specifications */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.85rem" }}>
          <div style={{ backgroundColor: "#F8FAFC", padding: "8px 12px", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Capacity</span>
            <span style={{ fontWeight: "700", color: "var(--dark)" }}>{vehicle.batteryCapacity || "N/A"} kWh</span>
          </div>
          <div style={{ backgroundColor: "#FEF08A", padding: "8px 12px", borderRadius: "8px", border: "1px solid #FDE047" }}>
            <span style={{ fontSize: "0.75rem", color: "#854D0E", display: "block" }}>Connector</span>
            <span style={{ fontWeight: "800", color: "var(--dark)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Zap size={14} fill="var(--dark)" />
              {vehicle.connectorType || "CCS2"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
