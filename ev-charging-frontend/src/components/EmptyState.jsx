import React from "react";
import { Zap, Inbox } from "lucide-react";

const EmptyState = ({
  icon: Icon = Inbox,
  title = "No data found",
  description = "There are no records to display at this moment.",
  actionText,
  onAction
}) => {
  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "260px"
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "#FEF08A",
          color: "var(--dark)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px"
        }}
      >
        <Icon size={32} />
      </div>

      <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>{title}</h3>
      <p
        style={{
          fontSize: "0.9rem",
          color: "var(--text-muted)",
          maxWidth: "400px",
          marginBottom: actionText ? "24px" : "0",
          lineHeight: "1.5"
        }}
      >
        {description}
      </p>

      {actionText && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          <Zap size={18} />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
