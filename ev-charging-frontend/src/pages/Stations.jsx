import React, { lazy, Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, Search, Filter, Plus, Zap, RefreshCw, LocateFixed, Navigation } from "lucide-react";
import { stationService } from "../services/stationService";
import { chargingPortService } from "../services/chargingPortService";
import StationCard from "../components/StationCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import StationDetails from "./StationDetails";

const ChargingStationMap = lazy(() => import("../components/ChargingStationMap"));

const hasValidCoordinates = (station) => {
  if (station.latitude == null || station.latitude === "" || station.longitude == null || station.longitude === "") {
    return false;
  }
  const latitude = Number(station.latitude);
  const longitude = Number(station.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
};

const getDistanceKm = (station, userLocation) => {
  if (!userLocation || !hasValidCoordinates(station)) return null;
  const latitude = Number(station.latitude);
  const longitude = Number(station.longitude);
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(latitude - userLocation.latitude);
  const longitudeDelta = toRadians(longitude - userLocation.longitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(userLocation.latitude)) * Math.cos(toRadians(latitude)) *
    Math.sin(longitudeDelta / 2) ** 2;
  const boundedHaversine = Math.min(1, Math.max(0, haversine));
  return 6371 * 2 * Math.atan2(Math.sqrt(boundedHaversine), Math.sqrt(1 - boundedHaversine));
};

const Stations = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const navigate = useNavigate();
  const { role } = useAuth();
  const isHost = role === "STATION_HOST";
  const isEvUser = role === "USER";

  const [stations, setStations] = useState([]);
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portError, setPortError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStationId, setSelectedStationId] = useState(null);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [availableNowOnly, setAvailableNowOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: 12.9716,
    longitude: 77.5946,
    status: "AVAILABLE"
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStations = useCallback(async () => {
    try {
      const data = isHost ? await stationService.getMyStation() : await stationService.getAll();
      setStations(isHost ? [data] : (Array.isArray(data) ? data : []));
      if (!isHost && isEvUser) {
        const portResult = await Promise.allSettled([chargingPortService.getAll()]);
        if (portResult[0].status === "fulfilled" && Array.isArray(portResult[0].value)) {
          setPorts(portResult[0].value);
        } else {
          setPorts([]);
          setPortError("Port availability and pricing could not be loaded. Station discovery is still available.");
        }
      } else {
        setPorts([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [isEvUser, isHost]);

  const refreshStations = () => {
    setLoading(true);
    setError(null);
    setPortError(null);
    fetchStations();
  };

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  useEffect(() => {
    if (!isEvUser || !navigator.permissions?.query || !navigator.geolocation) return;

    navigator.permissions.query({ name: "geolocation" }).then((permission) => {
      if (permission.state !== "granted") return;
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setUserLocation({ latitude: coords.latitude, longitude: coords.longitude }),
        () => {}
      );
    }).catch(() => {});
  }, [isEvUser]);

  const handleCreateStation = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Station name is required");
      return;
    }
    if (!formData.address.trim()) {
      setFormError("Station address is required");
      return;
    }

    setSubmitting(true);
    try {
      await stationService.create({
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      });
      setIsModalOpen(false);
      setLoading(true);
      setError(null);
      setPortError(null);
      setFormData({
        name: "",
        address: "",
        latitude: 12.9716,
        longitude: 77.5946,
        status: "AVAILABLE"
      });
      fetchStations();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStations = useMemo(() => stations.filter((st) => {
    const matchesSearch =
      st.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || st.status === statusFilter;
    const matchesAvailability = !availableNowOnly || (
      st.status === "AVAILABLE" && ports.some((port) => port.stationId === st.id && port.status === "AVAILABLE")
    );
    return matchesSearch && matchesStatus && matchesAvailability;
  }), [stations, searchQuery, statusFilter, availableNowOnly, ports]);

  const stationsWithPorts = useMemo(() => filteredStations.map((station) => ({
    ...station,
    ports: ports.filter((port) => port.stationId === station.id)
  })), [filteredStations, ports]);

  const orderedStations = useMemo(() => {
    if (!userLocation) return stationsWithPorts;
    return [...stationsWithPorts].sort((first, second) =>
      (getDistanceKm(first, userLocation) ?? Infinity) - (getDistanceKm(second, userLocation) ?? Infinity)
    );
  }, [stationsWithPorts, userLocation]);

  const requestUserLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser. You can still browse charging stations on the map.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setSelectedStationId(null);
      },
      (locationResult) => {
        if (locationResult.code === locationResult.PERMISSION_DENIED) {
          setLocationError("Location permission was denied. You can still browse charging stations on the map.");
        } else if (locationResult.code === locationResult.POSITION_UNAVAILABLE) {
          setLocationError("Your location is currently unavailable. You can still browse charging stations on the map.");
        } else {
          setLocationError("Unable to retrieve your location. You can still browse charging stations on the map.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const openStationDetails = (station) => navigate(`/stations/${station.id}`);

  const calculateDistance = (station) => {
    return getDistanceKm(station, userLocation);
  };

  const activeSelectedStationId = stationsWithPorts.some((station) => station.id === selectedStationId)
    ? selectedStationId
    : null;

  if (isHost) {
    if (loading) return <Loading fullScreen message="Loading your charging station..." />;
    if (stations[0]) return <StationDetails stationId={stations[0].id} />;
    return (
      <div className="animate-fade-in">
        <ErrorMessage message={error} onClose={() => setError(null)} />
        <EmptyState
          icon={MapPin}
          title="No charging station found"
          description="No charging station is associated with this Station Host account. Contact an administrator for assistance."
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem" }}>{isEvUser ? "Find Charging Stations" : "EV Charging Stations"}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Explore active fast chargers, check port availability, and book slots.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {isEvUser && (
            <button className="btn btn-secondary" onClick={requestUserLocation} title="Use My Location">
              <LocateFixed size={16} /> Use My Location
            </button>
          )}
          <button className="btn btn-secondary" onClick={refreshStations} title="Refresh stations">
            <RefreshCw size={16} />
          </button>
          {!isHost && <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Station
          </button>}
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError(null)} />
      {isEvUser && portError && <ErrorMessage message={portError} onClose={() => setPortError(null)} />}
      {isEvUser && locationError && (
        <div role="status" style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", background: "var(--info-bg)", color: "#1D4ED8", fontSize: "0.88rem" }}>
          {locationError}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: "16px",
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "space-between"
        }}
      >
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          <Search size={18} color="var(--text-light)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "40px" }}
            placeholder="Search station name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>Status:</span>
          {["ALL", "AVAILABLE", "UNAVAILABLE", "MAINTENANCE"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: "600",
                backgroundColor: statusFilter === status ? "var(--dark)" : "#F1F5F9",
                color: statusFilter === status ? "var(--primary-yellow)" : "var(--text-main)",
                transition: "var(--transition)"
              }}
            >
              {status}
            </button>
          ))}
        </div>
        {isEvUser && ports.length > 0 && (
          <button
            type="button"
            className={availableNowOnly ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            onClick={() => setAvailableNowOnly((current) => !current)}
            aria-pressed={availableNowOnly}
          >
            <Zap size={14} /> Available Now
          </button>
        )}
      </div>

      {/* Stations List */}
      {loading ? (
        <Loading fullScreen message="Fetching charging stations..." />
      ) : isEvUser && filteredStations.length > 0 ? (
        <div className="station-discovery-layout">
          <section className="station-discovery-list" aria-label="Charging station results">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h2 style={{ fontSize: "1.1rem" }}>Stations ({orderedStations.length})</h2>
              {userLocation && <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Nearest first</span>}
            </div>
            {orderedStations.map((station) => {
              const stationPorts = station.ports || [];
              const availablePorts = stationPorts.filter((port) => port.status === "AVAILABLE").length;
              const totalPorts = stationPorts.length;
              const priceValues = stationPorts
                .map((port) => Number(port.pricePerKwh))
                .filter((price) => Number.isFinite(price) && price >= 0);
              const distance = calculateDistance(station);
              const isSelected = station.id === activeSelectedStationId;

              return (
                <article
                  key={station.id}
                  className={`station-discovery-item ${isSelected ? "selected" : ""}`}
                >
                  <button
                    type="button"
                    className="station-discovery-select"
                    onClick={() => setSelectedStationId(station.id)}
                    aria-pressed={isSelected}
                  >
                    <span style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <strong>{station.name || "EV Charging Station"}</strong>
                      <span className={`station-status-label ${station.status === "AVAILABLE" ? "available" : ""}`}>
                        {station.status || "UNKNOWN"}
                      </span>
                    </span>
                    <span className="station-discovery-address">{station.address || "Address not provided"}</span>
                    <span className="station-discovery-meta">
                      <span>{totalPorts > 0 && availablePorts === 0 ? "Currently Full" : `${availablePorts} / ${totalPorts} ports available`}</span>
                      <span>{priceValues.length > 0 ? `From ₹${Math.min(...priceValues).toFixed(2)}/kWh` : "Pricing unavailable"}</span>
                      {distance !== null && <span>{distance.toFixed(1)} km away</span>}
                    </span>
                  </button>
                  <div className="station-discovery-actions">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => openStationDetails(station)}>
                      View Details & Book
                    </button>
                    {hasValidCoordinates(station) && (
                      <a
                        className="btn btn-secondary btn-sm"
                        href={`https://www.openstreetmap.org/directions?to=${Number(station.latitude)}%2C${Number(station.longitude)}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Get directions to ${station.name || "charging station"}`}
                      >
                        <Navigation size={14} /> Directions
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
          <section className="station-discovery-map" aria-label="OpenStreetMap charging station map">
            <Suspense fallback={<div role="status" style={{ height: "100%", minHeight: "320px", display: "grid", placeItems: "center", color: "var(--text-muted)" }}>Loading interactive map...</div>}>
              <ChargingStationMap
                stations={stationsWithPorts}
                selectedStationId={activeSelectedStationId}
                onSelectStation={setSelectedStationId}
                onViewStation={openStationDetails}
                userLocation={userLocation}
              />
            </Suspense>
          </section>
        </div>
      ) : filteredStations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={isEvUser ? "No charging stations available" : "No charging stations found"}
          description={isEvUser ? "No stations match the current search or filters." : "We couldn't find any station matching your search or filters."}
          actionText={isHost || isEvUser ? undefined : "Add New Station"}
          onAction={isHost || isEvUser ? undefined : () => setIsModalOpen(true)}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onBook={isHost ? undefined : (st) => navigate(`/stations/${st.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create Station Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>Add Charging Station</h2>
            <ErrorMessage message={formError} onClose={() => setFormError(null)} />

            <form onSubmit={handleCreateStation}>
              <div className="form-group">
                <label className="form-label">Station Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bharath EV Charging Hub"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Indiranagar, Bangalore, Karnataka"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="UNAVAILABLE">UNAVAILABLE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Create Station"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stations;
