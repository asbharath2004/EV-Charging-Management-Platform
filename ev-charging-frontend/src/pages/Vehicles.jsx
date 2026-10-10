import React, { useState, useEffect } from "react";
import { Plus, Car, Zap, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { vehicleService } from "../services/vehicleService";
import VehicleCard from "../components/VehicleCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { getErrorMessage } from "../services/api";

const Vehicles = () => {
  const { userId } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    registrationNumber: "",
    brand: "",
    model: "",
    batteryCapacity: 40.5,
    currentBatteryPercentage: 25.0,
    connectorType: "CCS2"
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [userId]);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.getByUser(userId);
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      registrationNumber: "",
      brand: "Tata",
      model: "Nexon EV",
      batteryCapacity: 40.5,
      currentBatteryPercentage: 50.0,
      connectorType: "CCS2"
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      registrationNumber: vehicle.registrationNumber || "",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      batteryCapacity: vehicle.batteryCapacity || 40.5,
      currentBatteryPercentage: vehicle.currentBatteryPercentage || 50.0,
      connectorType: vehicle.connectorType || "CCS2"
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.registrationNumber.trim()) {
      setFormError("Registration number is required");
      return;
    }
    if (!formData.brand.trim() || !formData.model.trim()) {
      setFormError("Brand and Model are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        userId: userId,
        batteryCapacity: Number(formData.batteryCapacity),
        currentBatteryPercentage: Number(formData.currentBatteryPercentage)
      };

      if (editingVehicle) {
        await vehicleService.update(editingVehicle.id, payload);
      } else {
        await vehicleService.create(payload);
      }

      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVehicle) return;
    setDeleting(true);
    try {
      await vehicleService.delete(deletingVehicle.id);
      setDeletingVehicle(null);
      fetchVehicles();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem" }}>My Electric Vehicles</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Manage registered EVs, monitor battery status, and connector compatibility.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={fetchVehicles} title="Refresh vehicles">
            <RefreshCw size={16} />
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} /> Add Vehicle
          </button>
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      {/* Vehicles Grid */}
      {loading ? (
        <Loading fullScreen message="Loading registered vehicles..." />
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No Electric Vehicles Registered"
          description="Register your EV to easily book charging slots and monitor charging sessions."
          actionText="Add Your First EV"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onEdit={handleOpenEditModal}
              onDelete={(veh) => setDeletingVehicle(veh)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>
              {editingVehicle ? "Edit Electric Vehicle" : "Register New EV"}
            </h2>
            <ErrorMessage message={formError} onClose={() => setFormError(null)} />

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Registration Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. KA01AB1234"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Brand *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Tata / MG / Hyundai"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Model *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Nexon EV / ZS EV"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Battery Capacity (kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    className="form-input"
                    value={formData.batteryCapacity}
                    onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Charge (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-input"
                    value={formData.currentBatteryPercentage}
                    onChange={(e) => setFormData({ ...formData, currentBatteryPercentage: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Connector Type</label>
                <select
                  className="form-select"
                  value={formData.connectorType}
                  onChange={(e) => setFormData({ ...formData, connectorType: e.target.value })}
                >
                  <option value="CCS2">CCS2</option>
                  <option value="Type 2">Type 2</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="GB/T">GB/T</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingVehicle ? "Update EV" : "Register EV"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Vehicle Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingVehicle}
        title="Delete Registered Vehicle"
        message={`Are you sure you want to delete ${deletingVehicle?.brand} ${deletingVehicle?.model} (${deletingVehicle?.registrationNumber})?`}
        confirmText="Delete EV"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingVehicle(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Vehicles;
