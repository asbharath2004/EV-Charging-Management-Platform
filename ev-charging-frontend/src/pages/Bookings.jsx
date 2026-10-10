import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Zap, Car, CheckCircle2, ArrowRight, ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { bookingService } from "../services/bookingService";
import { stationService } from "../services/stationService";
import { chargingPortService } from "../services/chargingPortService";
import { vehicleService } from "../services/vehicleService";
import { chargingSessionService } from "../services/chargingSessionService";
import BookingCard from "../components/BookingCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { getErrorMessage } from "../services/api";

const Bookings = () => {
  const { userId, role } = useAuth();
  const isHost = role === "STATION_HOST";
  const isFleet = role === "FLEET_OPERATOR";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedStationId = searchParams.get("stationId") || "";
  const preselectedPortId = searchParams.get("portId") || "";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Wizard Modal state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 to 5

  // Options state for wizard
  const [stations, setStations] = useState([]);
  const [ports, setPorts] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Wizard Form state
  const [selectedStationId, setSelectedStationId] = useState(preselectedStationId);
  const [selectedPortId, setSelectedPortId] = useState(preselectedPortId);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  
  // Date selection defaults (Today 10:00 to 11:00 or current ISO string)
  const defaultStart = new Date(Date.now() + 3600000).toISOString().slice(0, 16); // 1 hour from now
  const defaultEnd = new Date(Date.now() + 7200000).toISOString().slice(0, 16);   // 2 hours from now
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);

  const [wizardError, setWizardError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBookings();
    if (!isHost) loadWizardOptions();
  }, [userId, isHost]);

  useEffect(() => {
    if (preselectedStationId || preselectedPortId) {
      setIsWizardOpen(true);
      if (preselectedStationId) {
        setSelectedStationId(preselectedStationId);
        loadPortsForStation(preselectedStationId);
        setStep(2);
      }
      if (preselectedPortId) {
        setSelectedPortId(preselectedPortId);
        setStep(3);
      }
    }
  }, [preselectedStationId, preselectedPortId]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (isHost) {
        data = await bookingService.getForHost();
      } else if (isFleet) {
        data = await bookingService.getForFleet();
      } else {
        data = await bookingService.getByUser(userId);
      }
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadWizardOptions = async () => {
    try {
      const [stationList, vehicleList] = await Promise.all([
        stationService.getAll(),
        vehicleService.getByUser(userId)
      ]);
      setStations(Array.isArray(stationList) ? stationList : []);
      setVehicles(Array.isArray(vehicleList) ? vehicleList : []);

      if (vehicleList.length > 0) {
        setSelectedVehicleId(vehicleList[0].id);
      }
    } catch (err) {
      console.error("Wizard options load error:", err);
    }
  };

  const loadPortsForStation = async (stId) => {
    try {
      const portList = await chargingPortService.getByStation(stId);
      setPorts(Array.isArray(portList) ? portList : []);
    } catch (err) {
      console.error("Ports load error:", err);
    }
  };

  const handleSelectStation = (stId) => {
    setSelectedStationId(stId);
    setSelectedPortId("");
    loadPortsForStation(stId);
    setStep(2);
  };

  const handleCreateBooking = async () => {
    setWizardError(null);
    setSubmitting(true);

    try {
      // Backend expects ISO LocalDateTime format (e.g. 2026-08-28T10:00:00)
      const formattedStart = startTime.length === 16 ? `${startTime}:00` : startTime;
      const formattedEnd = endTime.length === 16 ? `${endTime}:00` : endTime;

      const payload = {
        userId,
        vehicleId: selectedVehicleId,
        stationId: selectedStationId,
        portId: selectedPortId,
        startTime: formattedStart,
        endTime: formattedEnd
      };

      await bookingService.create(payload);
      setIsWizardOpen(false);
      fetchBookings();
    } catch (err) {
      setWizardError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await bookingService.confirm(bookingId);
      fetchBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingService.cancel(bookingId);
      fetchBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleStartCharging = async (bookingId) => {
    try {
      await chargingSessionService.startSession(bookingId);
      navigate("/charging-sessions");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === "ALL") return true;
    return b.status === statusFilter;
  });

  const selectedStationObj = stations.find((s) => s.id === selectedStationId);
  const selectedPortObj = ports.find((p) => p.id === selectedPortId);
  const selectedVehicleObj = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem" }}>Charging Slot Bookings</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Reserve charging ports in advance, manage confirmations, and trigger charging sessions.
          </p>
        </div>

        {!isHost && <button className="btn btn-primary" onClick={() => setIsWizardOpen(true)}>
          <Plus size={18} /> New Booking
        </button>}
      </div>

      <ErrorMessage message={error} onClose={() => setError(null)} />

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: "600",
              backgroundColor: statusFilter === st ? "var(--dark)" : "var(--white)",
              color: statusFilter === st ? "var(--primary-yellow)" : "var(--text-main)",
              border: "1px solid var(--border-color)",
              transition: "var(--transition)"
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      {loading ? (
        <Loading fullScreen message="Loading bookings..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description="You have no charging slot bookings under this status."
          actionText="Book a Slot Now"
          onAction={() => setIsWizardOpen(true)}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredBookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
                  onConfirm={isHost ? handleConfirmBooking : undefined}
                  onCancel={isHost ? undefined : handleCancelBooking}
                  onStartCharging={isHost ? undefined : handleStartCharging}
            />
          ))}
        </div>
      )}

      {/* Modern 5-Step Booking Flow Wizard Modal */}
      {isWizardOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: "600px" }}>
            {/* Step Progress Indicator Header */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h2 style={{ fontSize: "1.25rem" }}>Create Charging Reservation</h2>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--primary-yellow-dark)" }}>
                  Step {step} of 5
                </span>
              </div>

              {/* Progress Bar Dots */}
              <div style={{ display: "flex", gap: "6px" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: "6px",
                      borderRadius: "999px",
                      backgroundColor: i <= step ? "var(--primary-yellow)" : "#E2E8F0",
                      transition: "var(--transition)"
                    }}
                  />
                ))}
              </div>
            </div>

            <ErrorMessage message={wizardError} onClose={() => setWizardError(null)} />

            {/* STEP 1: SELECT STATION */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", color: "var(--dark)" }}>
                  1. Select Charging Station
                </h3>
                {stations.length === 0 ? (
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>No stations available.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
                    {stations.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handleSelectStation(st.id)}
                        style={{
                          padding: "14px",
                          borderRadius: "var(--radius-md)",
                          border: selectedStationId === st.id ? "2px solid var(--primary-yellow-dark)" : "1px solid var(--border-color)",
                          backgroundColor: selectedStationId === st.id ? "#FEF9C3" : "#FFFFFF",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "700", color: "var(--dark)" }}>{st.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <MapPin size={14} /> {st.address}
                          </div>
                        </div>
                        <StatusBadge status={st.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: SELECT PORT */}
            {step === 2 && (
              <div>
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", color: "var(--dark)" }}>
                  2. Select Charging Port at {selectedStationObj?.name}
                </h3>
                {ports.length === 0 ? (
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>No charging ports found at this station.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
                    {ports.map((pt) => (
                      <div
                        key={pt.id}
                        onClick={() => {
                          setSelectedPortId(pt.id);
                          setStep(3);
                        }}
                        style={{
                          padding: "12px",
                          borderRadius: "var(--radius-md)",
                          border: selectedPortId === pt.id ? "2px solid var(--primary-yellow-dark)" : "1px solid var(--border-color)",
                          backgroundColor: selectedPortId === pt.id ? "#FEF9C3" : "#FFFFFF",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <span style={{ fontWeight: "800", color: "var(--dark)" }}>Port #{pt.portNumber}</span>
                          <StatusBadge status={pt.status} />
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {pt.connectorType} • {pt.powerKw} kW
                        </div>
                        <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--dark)", marginTop: "4px" }}>
                          {formatCurrency(pt.pricePerKwh)}/kWh
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: SELECT VEHICLE */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", color: "var(--dark)" }}>
                  3. Select Your Electric Vehicle
                </h3>
                {vehicles.length === 0 ? (
                  <div>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                      You have no registered vehicles. Please add a vehicle first.
                    </p>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate("/vehicles")}>
                      Go to Vehicles Page
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {vehicles.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedVehicleId(v.id);
                          setStep(4);
                        }}
                        style={{
                          padding: "14px",
                          borderRadius: "var(--radius-md)",
                          border: selectedVehicleId === v.id ? "2px solid var(--primary-yellow-dark)" : "1px solid var(--border-color)",
                          backgroundColor: selectedVehicleId === v.id ? "#FEF9C3" : "#FFFFFF",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Car size={24} color="var(--dark)" />
                          <div>
                            <div style={{ fontWeight: "700", color: "var(--dark)" }}>
                              {v.brand} {v.model}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                              {v.registrationNumber} • {v.connectorType}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{v.currentBatteryPercentage}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: SELECT TIME */}
            {step === 4 && (
              <div>
                <h3 style={{ fontSize: "1rem", marginBottom: "16px", color: "var(--dark)" }}>
                  4. Select Charging Schedule
                </h3>
                <div className="form-group">
                  <label className="form-label">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & CONFIRM */}
            {step === 5 && (
              <div>
                <h3 style={{ fontSize: "1rem", marginBottom: "16px", color: "var(--dark)" }}>
                  5. Review Reservation Details
                </h3>

                <div style={{ backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Station:</span>
                    <span style={{ fontWeight: "700" }}>{selectedStationObj?.name || "Selected Station"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Port:</span>
                    <span style={{ fontWeight: "700" }}>Port #{selectedPortObj?.portNumber || 1} ({selectedPortObj?.connectorType})</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Vehicle:</span>
                    <span style={{ fontWeight: "700" }}>{selectedVehicleObj?.brand} {selectedVehicleObj?.model} ({selectedVehicleObj?.registrationNumber})</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Start Time:</span>
                    <span style={{ fontWeight: "600" }}>{formatDateTime(startTime)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>End Time:</span>
                    <span style={{ fontWeight: "600" }}>{formatDateTime(endTime)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons for wizard */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
              {step > 1 ? (
                <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={() => setIsWizardOpen(false)}>
                  Cancel
                </button>
              )}

              {step < 5 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (step === 1 && !selectedStationId) {
                      setWizardError("Please select a station");
                      return;
                    }
                    if (step === 2 && !selectedPortId) {
                      setWizardError("Please select a charging port");
                      return;
                    }
                    if (step === 3 && !selectedVehicleId) {
                      setWizardError("Please select a vehicle");
                      return;
                    }
                    setWizardError(null);
                    setStep(step + 1);
                  }}
                >
                  Next Step <ArrowRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleCreateBooking} disabled={submitting}>
                  <CheckCircle2 size={16} />
                  {submitting ? "Booking..." : "Confirm Reservation"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
