import React from "react";
import { CreditCard, CheckCircle, Calendar, Hash, Zap } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDateTime } from "../utils/formatters";

const PaymentCard = ({ payment, onDownloadReceipt }) => {
  if (!payment) return null;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--success-bg)",
                color: "var(--success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <CheckCircle size={20} />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                Method
              </span>
              <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--dark)" }}>
                {payment.paymentMethod || "UPI"}
              </div>
            </div>
          </div>
          <StatusBadge status={payment.status || "SUCCESS"} />
        </div>

        <div
          style={{
            backgroundColor: "#FEF9C3",
            border: "1px dashed #FDE047",
            borderRadius: "var(--radius-md)",
            padding: "14px",
            textAlign: "center",
            marginBottom: "16px"
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#854D0E", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Amount Paid
          </span>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--dark)", fontFamily: "'Outfit', sans-serif" }}>
            {formatCurrency(payment.amount)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-main)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Hash size={14} /> Transaction ID
            </span>
            <span style={{ fontFamily: "monospace", fontWeight: "600" }}>
              {payment.transactionId ? payment.transactionId.slice(0, 16) + "..." : "TXN-XXXXXX"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Zap size={14} /> Session ID
            </span>
            <span style={{ fontFamily: "monospace", fontWeight: "600" }}>
              {payment.chargingSessionId ? payment.chargingSessionId.slice(-8) : "N/A"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={14} /> Date & Time
            </span>
            <span style={{ fontWeight: "600" }}>
              {formatDateTime(payment.paymentDate)}
            </span>
          </div>
        </div>
      </div>

      {onDownloadReceipt && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onDownloadReceipt(payment)}
          style={{ width: "100%", marginTop: "16px" }}
        >
          Download Receipt (PDF)
        </button>
      )}
    </div>
  );
};

export default PaymentCard;
