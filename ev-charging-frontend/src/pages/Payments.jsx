import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CreditCard, CheckCircle2, Download, RefreshCw, Smartphone, DollarSign, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { paymentService } from "../services/paymentService";
import PaymentCard from "../components/PaymentCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { getErrorMessage } from "../services/api";

const Payments = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedSessionId = searchParams.get("sessionId") || "";
  const preselectedCost = searchParams.get("cost") ? Number(searchParams.get("cost")) : 240.0;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form / Receipt state
  const [chargingSessionId, setChargingSessionId] = useState(preselectedSessionId);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [submitting, setSubmitting] = useState(false);
  const [successPayment, setSuccessPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [role]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (role === "USER") {
        data = await paymentService.getMyPayments();
      } else if (role === "STATION_HOST") {
        data = await paymentService.getHostRevenue();
      } else if (role === "FLEET_OPERATOR") {
        data = await paymentService.getFleetPayments();
      } else {
        data = await paymentService.getAll();
      }
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    setError(null);

    if (!chargingSessionId.trim()) {
      setError("Charging Session ID is required to process payment.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await paymentService.create({
        chargingSessionId: chargingSessionId.trim(),
        paymentMethod
      });
      setSuccessPayment(result);
      fetchPayments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReceiptAlert = (paymentObj) => {
    alert(`Downloading PDF receipt for Transaction #${paymentObj.transactionId || paymentObj.id}...`);
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem" }}>Payments & Receipts</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Settle charging session invoices and view complete transaction history.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchPayments} title="Refresh payments">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      {/* Payment Success Receipt Banner */}
      {successPayment ? (
        <div
          className="card animate-fade-in"
          style={{
            border: "2px solid var(--success)",
            backgroundColor: "#F0FDF4",
            padding: "32px",
            textAlign: "center",
            maxWidth: "600px",
            margin: "0 auto",
            width: "100%"
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "var(--success-bg)",
              color: "var(--success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}
          >
            <CheckCircle2 size={40} />
          </div>

          <h2 style={{ fontSize: "1.5rem", color: "#15803D", marginBottom: "4px" }}>
            Payment Successful!
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
            Transaction processed and verified.
          </p>

          <div
            style={{
              backgroundColor: "var(--white)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              border: "1px solid #BBF7D0",
              textAlign: "left",
              marginBottom: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "0.9rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Amount Paid:</span>
              <span style={{ fontWeight: "800", color: "var(--dark)", fontSize: "1.1rem" }}>
                {formatCurrency(successPayment.amount)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Payment Method:</span>
              <span style={{ fontWeight: "700" }}>{successPayment.paymentMethod}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Transaction ID:</span>
              <span style={{ fontFamily: "monospace", fontWeight: "600" }}>{successPayment.transactionId}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Date & Time:</span>
              <span>{formatDateTime(successPayment.paymentDate)}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => handleDownloadReceiptAlert(successPayment)}
            >
              <Download size={16} /> Download Receipt UI
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => setSuccessPayment(null)}
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        /* Create Payment Card Form (If sessionId provided or active) */
        chargingSessionId && (
          <div className="card animate-fade-in" style={{ padding: "28px", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
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
                <CreditCard size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.3rem" }}>Process Charging Payment</h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Session ID: #{chargingSessionId.slice(-8)}
                </p>
              </div>
            </div>

            <form onSubmit={handleMakePayment}>
              <div
                style={{
                  backgroundColor: "#FEF9C3",
                  border: "1px solid #FDE047",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span style={{ fontSize: "0.9rem", color: "#854D0E", fontWeight: "600" }}>Total Invoice Amount:</span>
                <span style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--dark)", fontFamily: "'Outfit', sans-serif" }}>
                  {formatCurrency(preselectedCost)}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Select Payment Method</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  {[
                    { id: "UPI", label: "UPI", icon: Smartphone },
                    { id: "CARD", label: "Card", icon: CreditCard },
                    { id: "CASH", label: "Cash", icon: DollarSign }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSel = paymentMethod === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        style={{
                          padding: "12px",
                          borderRadius: "var(--radius-md)",
                          border: isSel ? "2px solid var(--primary-yellow-dark)" : "1px solid var(--border-color)",
                          backgroundColor: isSel ? "#FEF9C3" : "#FFFFFF",
                          cursor: "pointer",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <Icon size={20} color={isSel ? "var(--dark)" : "var(--text-muted)"} />
                        <span style={{ fontSize: "0.85rem", fontWeight: isSel ? "700" : "500", color: "var(--dark)" }}>
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "20px", marginTop: "12px" }}>
                <ShieldCheck size={16} color="var(--success)" /> Encrypted & Secure 256-bit EV Payment Gateway
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={submitting}>
                {submitting ? "Processing Payment..." : `Pay ${formatCurrency(preselectedCost)} Now`}
              </button>
            </form>
          </div>
        )
      )}

      {/* Payment History List */}
      <div>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>Payment History</h2>

        {loading ? (
          <Loading fullScreen message="Loading transaction history..." />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Payment History"
            description="You have no recorded payments."
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onDownloadReceipt={handleDownloadReceiptAlert}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
