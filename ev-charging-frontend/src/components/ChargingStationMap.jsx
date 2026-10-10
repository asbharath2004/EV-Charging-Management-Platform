import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  CircleMarker,
  TileLayer,
  useMap
} from "react-leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { formatCurrency } from "../utils/formatters";
import "./ChargingStationMap.css";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [12.9716, 77.5946];
const DEFAULT_ZOOM = 12;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const validCoordinates = (station) => {
  if (station.latitude == null || station.latitude === "" || station.longitude == null || station.longitude === "") {
    return false;
  }
  const latitude = Number(station.latitude);
  const longitude = Number(station.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
};

const getStationMetrics = (station) => {
  const ports = Array.isArray(station.ports) ? station.ports : [];
  const availablePorts = station.availablePorts ?? ports.filter((port) => port.status === "AVAILABLE").length;
  const totalPorts = station.totalPorts ?? ports.length;
  const prices = ports
    .map((port) => Number(port.pricePerKwh))
    .filter((price) => Number.isFinite(price) && price >= 0);
  const pricePerKwh = station.pricePerKwh ?? (prices.length > 0 ? Math.min(...prices) : null);
  return { availablePorts, totalPorts, pricePerKwh };
};

const MapViewportController = ({ stations, selectedStationId, userLocation, markerRefs }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedStationId) {
      const selectedStation = stations.find((station) => station.id === selectedStationId);
      if (selectedStation && validCoordinates(selectedStation)) {
        const position = [Number(selectedStation.latitude), Number(selectedStation.longitude)];
        map.flyTo(position, 14, { duration: 0.5 });
        markerRefs.current.get(selectedStationId)?.openPopup();
        return;
      }
    }

    if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 13);
      return;
    }

    const coordinates = stations
      .filter(validCoordinates)
      .map((station) => [Number(station.latitude), Number(station.longitude)]);

    if (coordinates.length > 1) {
      map.fitBounds(L.latLngBounds(coordinates), { padding: [32, 32], maxZoom: 14 });
    } else if (coordinates.length === 1) {
      map.setView(coordinates[0], 14);
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [map, stations, selectedStationId, userLocation, markerRefs]);

  return null;
};

const ChargingStationMap = ({
  stations = [],
  selectedStationId,
  onSelectStation,
  onViewStation,
  userLocation
}) => {
  const markerRefs = useRef(new Map());
  const mappedStations = useMemo(() => stations.filter(validCoordinates), [stations]);
  const [tileError, setTileError] = useState(false);

  return (
    <div className="charging-map-shell">
      {stations.length > mappedStations.length && (
        <div className="charging-map-notice">
          {mappedStations.length === 0
            ? "Station coordinates are unavailable or invalid. The map is shown at the default location."
            : "Some station locations are unavailable or invalid and were skipped on the map."}
        </div>
      )}
      {tileError && (
        <div className="charging-map-notice" role="status">
          OpenStreetMap tiles could not be loaded. Check your connection and try again.
        </div>
      )}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="charging-map"
        scrollWheelZoom
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => setTileError(true),
            load: () => setTileError(false)
          }}
        />
        <MapViewportController
          stations={mappedStations}
          selectedStationId={selectedStationId}
          userLocation={userLocation}
          markerRefs={markerRefs}
        />
        {mappedStations.map((station) => {
          const metrics = getStationMetrics(station);
          return (
            <Marker
              key={station.id}
              position={[Number(station.latitude), Number(station.longitude)]}
              ref={(marker) => {
                if (marker) markerRefs.current.set(station.id, marker);
                else markerRefs.current.delete(station.id);
              }}
              eventHandlers={{ click: () => onSelectStation?.(station.id) }}
            >
              <Popup>
                <div className="charging-map-popup">
                  <strong>{station.name || "EV Charging Station"}</strong>
                  <span>{station.address || "Address not provided"}</span>
                  {station.city && <span>City: {station.city}</span>}
                  <span>Status: {station.status || "Unknown"}</span>
                  <span>
                    Available Ports: {metrics.availablePorts} / {metrics.totalPorts}
                    {metrics.totalPorts > 0 && metrics.availablePorts === 0 && " · Currently Full"}
                  </span>
                  <span>
                    Price: {metrics.pricePerKwh == null ? "Not available" : `${formatCurrency(metrics.pricePerKwh)}/kWh`}
                  </span>
                  <a
                    href={`https://www.openstreetmap.org/directions?to=${Number(station.latitude)}%2C${Number(station.longitude)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="charging-map-directions"
                  >
                    Get Directions
                  </a>
                  {onViewStation && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onViewStation(station)}
                    >
                      View Station
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        {userLocation && (
          <CircleMarker
            center={[userLocation.latitude, userLocation.longitude]}
            radius={9}
            pathOptions={{ color: "#FFFFFF", weight: 3, fillColor: "#2563EB", fillOpacity: 1 }}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
};

export default ChargingStationMap;
