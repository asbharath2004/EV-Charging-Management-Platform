import React, { useState, useEffect } from "react";
import { Users, MapPin, Cpu, Car, Calendar, Activity, DollarSign, Shield, Trash2, Edit, AlertCircle, RefreshCw } from "lucide-react";
import { userService } from "../services/userService";
import { stationService } from "../services/stationService";
import { vehicleService } from "../services/vehicleService";
import { bookingService } from "../services/bookingService";
import { chargingSessionService } from "../services/chargingSessionService";
import { paymentService } from "../services/paymentService";
import { chargingPortService } from "../services/chargingPortService";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatCurrency } from "../utils/formatters";
import { getErrorMessage } from "../services/api";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pendingPorts, setPendingPorts] = useState([]);

  // Modal / Confirm state for user role editing & deletion
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState("USER");
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uRes, sRes, vRes, bRes, csRes, pRes, ppRes] = await Promise.allSettled([
        userService.getAll(),
        stationService.getAll(),
        vehicleService.getAll(),
        bookingService.getAll(),
        chargingSessionService.getAll(),
        paymentService.getAll(),
        chargingPortService.getAdminPending()
      ]);

      setUsers(uRes.status === "fulfilled" && Array.isArray(uRes.value) ? uRes.value : []);
      setStations(sRes.status === "fulfilled" && Array.isArray(sRes.value) ? sRes.value : []);
      setVehicles(vRes.status === "fulfilled" && Array.isArray(vRes.value) ? vRes.value : []);
      setBookings(bRes.status === "fulfilled" && Array.isArray(bRes.value) ? bRes.value : []);
      setSessions(csRes.status === "fulfilled" && Array.isArray(csRes.value) ? csRes.value : []);
      setPayments(pRes.status === "fulfilled" && Array.isArray(pRes.value) ? pRes.value : []);
      setPendingPorts(ppRes.status === "fulfilled" && Array.isArray(ppRes.value) ? ppRes.value : []);
    } catch (err) {
      setError("Failed to load System Admin analytics");
    } finally {
      setLoading(false);
    }
  };

  const handlePortApproval = async (port, approvalStatus) => {
    const rejectionReason = approvalStatus === "REJECTED"
      ? window.prompt("Enter the rejection reason:")
      : undefined;
    if (approvalStatus === "REJECTED" && !rejectionReason?.trim()) return;
    try {
      await chargingPortService.updateAdminApproval(port.id, approvalStatus, rejectionReason?.trim());
      await fetchAdminData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setError(null);
    try {
      await userService.update(selectedUser.id, {
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone,
        role: newRole
      });
      setEditRoleModalOpen(false);
      setSelectedUser(null);
      await fetchAdminData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setActionLoading(true);
    setError(null);
    try {
      await userService.delete(deleteConfirmUser.id);
      setDeleteConfirmUser(null);
      await fetchAdminData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading message="Loading System Admin Platform..." />;

  const activeSessionsCount = sessions.filter((s) => s.status === "IN_PROGRESS").length;
  const completedSessionsCount = sessions.filter((s) => s.status === "COMPLETED").length;
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalEnergyConsumed = sessions.reduce((sum, s) => sum + (s.energyConsumedKwh || 0), 0);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
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
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              color: "#FCA5A5",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: "700",
              marginBottom: "12px",
              border: "1px solid rgba(239, 68, 68, 0.4)"
            }}
          >
            <Shield size={14} /> SYSTEM ADMIN CONTROL CENTER
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--white)" }}>
            Platform Overview
          </h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem", marginTop: "4px" }}>
            Global user account control, system revenue analysis, station infrastructure monitoring.
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn btn-secondary btn-sm" style={{ color: "var(--white)" }}>
          <RefreshCw size={16} /> Refresh Metrics
        </button>
      </div>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      {/* Admin Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="stat-label">TOTAL USERS</span>
              <div className="stat-value">{users.length}</div>
            </div>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "var(--dark)", color: "var(--primary-yellow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={22} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>Registered Platform Users</span>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="stat-label">TOTAL STATIONS</span>
              <div className="stat-value">{stations.length}</div>
            </div>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "var(--dark)", color: "var(--primary-yellow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin size={22} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>EV Charging Locations</span>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="stat-label">ACTIVE SESSIONS</span>
              <div className="stat-value">{activeSessionsCount}</div>
            </div>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "var(--dark)", color: "var(--primary-yellow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={22} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: "600", marginTop: "6px", display: "block" }}>Live EV Charging Now</span>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="stat-label">PLATFORM REVENUE</span>
              <div className="stat-value">{formatCurrency(totalRevenue)}</div>
            </div>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "var(--dark)", color: "var(--primary-yellow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={22} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>Total Gross Revenue</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">PENDING PORT REQUESTS</span>
          <div className="stat-value">{pendingPorts.length}</div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>Awaiting port approval</span>
        </div>
      </div>

      <div id="port-requests" className="card" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px" }}>
          Port Requests ({pendingPorts.length})
        </h3>
        {pendingPorts.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No pending port requests.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {pendingPorts.map((port) => (
              <div key={port.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", padding: "14px", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)" }}>
                <div>
                  <strong>Port #{port.portNumber} · {port.connectorType}</strong>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    {port.stationName || port.stationId} · {port.ownerEmail || port.ownerId || "Owner unavailable"} · {port.powerKw} kW · ₹{port.pricePerKwh}/kWh
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handlePortApproval(port, "APPROVED")}>Approve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handlePortApproval(port, "REJECTED")}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Users Management Table */}
      <div className="card" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px", color: "var(--dark)" }}>
          Registered Platform Accounts ({users.length})
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{u.id}</td>
                  <td style={{ fontWeight: "600" }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        backgroundColor: u.role === "ADMIN" ? "#FEE2E2" : u.role === "STATION_HOST" ? "#FEF9C3" : u.role === "FLEET_OPERATOR" ? "#DBEAFE" : "#E2E8F0",
                        color: u.role === "ADMIN" ? "#991B1B" : u.role === "STATION_HOST" ? "#854D0E" : u.role === "FLEET_OPERATOR" ? "#1E40AF" : "#334155"
                      }}
                    >
                      {u.role || "USER"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setNewRole(u.role || "USER");
                          setEditRoleModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit size={14} /> Role
                      </button>
                      <button
                        onClick={() => setDeleteConfirmUser(u)}
                        className="btn btn-danger btn-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editRoleModalOpen && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "420px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "12px" }}>
              Edit User Role: {selectedUser.name}
            </h3>
            <div className="form-group">
              <label className="form-label">Select System Role</label>
              <select
                className="form-input"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="USER">USER (EV Driver)</option>
                <option value="STATION_HOST">STATION_HOST</option>
                <option value="FLEET_OPERATOR">FLEET_OPERATOR</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setEditRoleModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdateRole} className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? "Updating..." : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {deleteConfirmUser && (
        <ConfirmDialog
          isOpen={true}
          title="Delete User Account"
          message={`Are you sure you want to delete account ${deleteConfirmUser.email}? This action cannot be undone.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteConfirmUser(null)}
          confirmText="Delete Account"
          isDanger
        />
      )}
    </div>
  );
};

export default AdminDashboard;
