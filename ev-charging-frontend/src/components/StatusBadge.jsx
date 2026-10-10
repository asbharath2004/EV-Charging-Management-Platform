import React from "react";
import { CheckCircle2, Clock, AlertTriangle, XCircle, Zap, RefreshCw } from "lucide-react";

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  const getConfig = () => {
    switch (normalized) {
      case "AVAILABLE":
      case "COMPLETED":
      case "SUCCESS":
        return {
          className: "badge-available",
          icon: CheckCircle2,
          text: normalized
        };
      case "OCCUPIED":
      case "PENDING":
      case "IN_PROGRESS":
      case "END_REQUESTED":
        return {
          className: "badge-occupied",
          icon: normalized === "IN_PROGRESS" ? Zap : Clock,
          text: normalized === "IN_PROGRESS" ? "CHARGING NOW" : normalized
        };
      case "CONFIRMED":
        return {
          className: "badge-available",
          icon: CheckCircle2,
          text: "CONFIRMED"
        };
      case "FAULTED":
      case "CANCELLED":
      case "UNAVAILABLE":
      case "ERROR":
      case "FAILED":
        return {
          className: "badge-faulted",
          icon: XCircle,
          text: normalized
        };
      case "MAINTENANCE":
        return {
          className: "badge-yellow",
          icon: AlertTriangle,
          text: "MAINTENANCE"
        };
      case "OFFLINE":
      default:
        return {
          className: "badge-offline",
          icon: RefreshCw,
          text: normalized
        };
    }
  };

  const { className, icon: Icon, text } = getConfig();

  return (
    <span className={`badge ${className}`}>
      <Icon size={12} strokeWidth={2.5} />
      <span>{text}</span>
    </span>
  );
};

export default StatusBadge;
