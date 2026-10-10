import React, { lazy, Suspense, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Zap, Plus, ArrowLeft, Trash2, Edit } from "lucide-react";
import { stationService } from "../services/stationService";
import { chargingPortService } from "../services/chargingPortService";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { formatCurrency } from "../utils/formatters";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ChargingStationMap = lazy(() => import("../components/ChargingStationMap"));

const StationDetails = ({ stationId }) => {
  const { id: routeId } = useParams();
  const id = stationId || routeId;
  const navigate = useNavigate();
  const { role } = useAuth();
  const isHost = role === "STATION_HOST";

  const [station, setStation] = useState(null);
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Port Modal
  const [isPortModalOpen, setIsPortModalOpen] = useState(false);
  const [portFormData, setPortFormData] = useState({
    portNumber: 1,
    connectorType: "CCS2",
    powerKw: 60.0,
    status: "AVAILABLE",
    pricePerKwh: 12.0
  });
  const [submittingPort, setSubmittingPort] = useState(false);
  const [portFormError, setPortFormError] = useState(null);
  const [editingPort, setEditingPort] = useState(null);
  const canManagePorts = role === "ADMIN" || (isHost && station?.approvalStatus === "APPROVED");

  const fetchStationAndPorts = useCallback(async () => {
    try {
      const [stationData, portList] = await Promise.all([
        stationService.getById(id),
        chargingPortService.getByStation(id)
      ]);
      setStation(stationData);
      setPorts(Array.isArray(portList) ? portList : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStationAndPorts();
  }, [fetchStationAndPorts]);

  const handleCreatePort = async (e) => {
    e.preventDefault();
    setPortFormError(null);
    setSubmittingPort(true);

    try {
      const payload = {
        ...portFormData,
        stationId: id,
        portNumber: Number(portFormData.portNumber),
        powerKw: Number(portFormData.powerKw),
        pricePerKwh: Number(portFormData.pricePerKwh)
      };
      if (editingPort) {
        await chargingPortService.update(editingPort.id, payload);
      } else {
        await chargingPortService.create(payload);
      }
      setIsPortModalOpen(false);
      setEditingPort(null);
      setLoading(true);
      setError(null);
      fetchStationAndPorts();
    } catch (err) {
      setPortFormError(getErrorMessage(err));
    } finally {
      setSubmittingPort(false);
    }
  };

  const openAddPort = () => {
    setEditingPort(null);
    setPortFormError(null);
    setIsPortModalOpen(true);
  };

  const openEditPort = (port) => {
    setEditingPort(port);
    setPortFormError(null);
    setPortFormData({
      portNumber: port.portNumber,
      connectorType: port.connectorType,
      powerKw: port.powerKw,
      status: port.status,
      pricePerKwh: port.pricePerKwh
    });
    setIsPortModalOpen(true);
  };

  const handleDeletePort = async (portId) => {
    if (!window.confirm("Are you sure you want to remove this port?")) return;
    try {
      await chargingPortService.delete(portId);
      setLoading(true);
      setError(null);
      fetchStationAndPorts();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading station & ports details..." />;
  }

  if (!station) {
    return (
      <EmptyState
        title="Station not found"
        description="The requested charging station could not be found."
        actionText="Back to Stations"
        onAction={() => navigate("/stations")}
      />
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Back button & Station Header */}
      <div>
        <button
          onClick={() => navigate("/stations")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            fontWeight: "600",
            marginBottom: "12px"
          }}
        >
          <ArrowLeft size={16} /> Back to Stations
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h1 style={{ fontSize: "1.85rem" }}>{station.name}</h1>
              <StatusBadge status={station.status} />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              <MapPin size={16} color="var(--primary-yellow-dark)" /> {station.address}
            </p>
            {station.approvalStatus && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "6px" }}>
                Approval: <strong>{station.approvalStatus}</strong>
                {station.rejectionReason ? ` - ${station.rejectionReason}` : ""}
              </p>
            )}
            {isHost && station.approvalStatus === "PENDING" && <p style={{ color: "var(--primary-yellow-dark)", fontWeight: "600", marginTop: "8px" }}>Your station is waiting for administrator approval.</p>}
            {isHost && station.approvalStatus === "REJECTED" && <p style={{ color: "var(--danger)", fontWeight: "600", marginTop: "8px" }}>Your station was rejected.</p>}
            {isHost && station.approvalStatus === "APPROVED" && <p style={{ color: "var(--success)", fontWeight: "600", marginTop: "8px" }}>Your station has been approved.</p>}
          </div>

          {canManagePorts && <button className="btn btn-primary" onClick={openAddPort}>
            <Plus size={18} /> Add Charging Port
          </button>}
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      <section aria-label={`${station.name} location`}>
        <h2 style={{ fontSize: "1.15rem", marginBottom: "10px" }}>Station Location</h2>
        <div style={{ height: "320px" }}>
          <Suspense fallback={<div role="status" style={{ height: "100%", display: "grid", placeItems: "center", color: "var(--text-muted)" }}>Loading interactive map...</div>}>
            <ChargingStationMap stations={[{ ...station, ports }]} />
          </Suspense>
        </div>
      </section>

      {/* Ports List Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.4rem" }}>
          Charging Ports ({ports.length})
        </h2>
      </div>

      {/* Ports Grid */}
      {ports.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No charging ports added yet"
          description="This station has no ports configured. Add a port to make it operational."
          actionText={canManagePorts ? "Add Charging Port" : undefined}
          onAction={canManagePorts ? openAddPort : undefined}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
          {ports.map((port) => (
            <div key={port.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: "var(--dark)",
                        color: "var(--primary-yellow)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "800",
                        fontSize: "0.95rem"
                      }}
                    >
                      P{port.portNumber}
                    </div>
                    <div>
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--dark)" }}>
                        Port #{port.portNumber}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={port.status} />
                </div>

                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                  Approval: <strong>{port.approvalStatus || "PENDING"}</strong>
                  {port.rejectionReason ? ` - ${port.rejectionReason}` : ""}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.85rem", marginBottom: "14px" }}>
                  <div style={{ backgroundColor: "#F8FAFC", padding: "8px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Connector</span>
                    <span style={{ fontWeight: "700", color: "var(--dark)" }}>{port.connectorType || "CCS2"}</span>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFC", padding: "8px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Power</span>
                    <span style={{ fontWeight: "700", color: "var(--dark)" }}>{port.powerKw} kW</span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#FEF9C3",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px"
                  }}
                >
                  <span style={{ fontSize: "0.8rem", color: "#854D0E", fontWeight: "600" }}>Tariff</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--dark)" }}>
                    {formatCurrency(port.pricePerKwh)} / kWh
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                {!isHost && port.status === "AVAILABLE" ? (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/bookings?stationId=${station.id}&portId=${port.id}`)}
                  >
                    <Zap size={14} /> Book Port
                  </button>
                ) : !isHost ? (
                  <button className="btn btn-secondary btn-sm" disabled style={{ flex: 1 }}>
                    Not Available
                  </button>
                ) : null}

                {canManagePorts && <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEditPort(port)}
                  style={{ padding: "6px 10px" }}
                  title="Edit Port"
                >
                  <Edit size={14} />
                </button>}

                {canManagePorts && <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDeletePort(port.id)}
                  style={{ color: "var(--danger)", padding: "6px 10px" }}
                  title="Delete Port"
                >
                  <Trash2 size={14} />
                </button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Port Modal */}
      {isPortModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>{editingPort ? "Edit Charging Port" : "Add Charging Port"}</h2>
            <ErrorMessage message={portFormError} onClose={() => setPortFormError(null)} />

            <form onSubmit={handleCreatePort}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Port Number *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={portFormData.portNumber}
                    onChange={(e) => setPortFormData({ ...portFormData, portNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Connector Type</label>
                  <select
                    className="form-select"
                    value={portFormData.connectorType}
                    onChange={(e) => setPortFormData({ ...portFormData, connectorType: e.target.value })}
                  >
                    <option value="CCS2">CCS2</option>
                    <option value="Type 2">Type 2</option>
                    <option value="CHAdeMO">CHAdeMO</option>
                    <option value="GB/T">GB/T</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Power (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={portFormData.powerKw}
                    onChange={(e) => setPortFormData({ ...portFormData, powerKw: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price per kWh (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={portFormData.pricePerKwh}
                    onChange={(e) => setPortFormData({ ...portFormData, pricePerKwh: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={portFormData.status}
                  onChange={(e) => setPortFormData({ ...portFormData, status: e.target.value })}
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="OCCUPIED">OCCUPIED</option>
                  <option value="FAULTED">FAULTED</option>
                  <option value="OFFLINE">OFFLINE</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsPortModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingPort}>
                  {submittingPort ? "Saving..." : editingPort ? "Save Port" : "Add Port"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationDetails;
