import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helper component to recenter map dynamically when center coordinates change
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      map.flyTo(center, zoom || 14, { duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

// Helper component for user clicking on map to pick location
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Marker generator using clean SVGs to eliminate broken image assets
export function createPinIcon(severity = "Medium", isResolved = false) {
  let color = "#3b82f6"; // Blue (Medium)
  if (isResolved) {
    color = "#10b981"; // Emerald
  } else if (severity === "Critical") {
    color = "#ef4444"; // Red
  } else if (severity === "High") {
    color = "#f59e0b"; // Amber
  }

  const svgHtml = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      cursor: pointer;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `;

  return L.divIcon({
    className: "custom-map-pin",
    html: svgHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export default function InteractiveMap({
  center = [12.9716, 77.5946], // Default City center
  zoom = 13,
  markers = [],
  selectedPosition = null,
  onLocationSelect = null,
  interactive = true,
  height = "380px"
}) {
  const activeCenter = selectedPosition || center;

  return (
    <div className="leaflet-map-wrapper" style={{ height, width: "100%", borderRadius: "14px", overflow: "hidden" }}>
      <MapContainer
        center={activeCenter}
        zoom={zoom}
        scrollWheelZoom={interactive}
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView center={activeCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}

        {/* Singular selected location marker (for complaint registration) */}
        {selectedPosition && Number.isFinite(selectedPosition[0]) && Number.isFinite(selectedPosition[1]) && (
          <Marker 
            position={selectedPosition} 
            icon={createPinIcon("Critical", false)}
          >
            <Popup>
              <strong>Selected Complaint Incident Spot</strong><br />
              Lat: {selectedPosition[0].toFixed(5)}, Lng: {selectedPosition[1].toFixed(5)}
            </Popup>
          </Marker>
        )}

        {/* Array of complaint markers (for authority dashboard) */}
        {markers.map((item) => {
          const lat = Number(item.latitude);
          const lng = Number(item.longitude);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          const isResolved = item.status === "Resolved";
          const icon = createPinIcon(item.severity, isResolved);

          return (
            <Marker key={item.id} position={[lat, lng]} icon={icon}>
              <Popup>
                <div className="map-popup-card">
                  <div className="popup-category-badge">{item.category}</div>
                  <h4 className="popup-title">{item.title || item.description.slice(0, 45)}</h4>
                  <div className="popup-meta">
                    <span className={`popup-status-pill status-${(item.status || 'submitted').toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.status}
                    </span>
                    <span className="popup-severity-pill">
                      {item.severity} Priority
                    </span>
                  </div>
                  <p className="popup-desc">{item.description.slice(0, 85)}...</p>
                  <div className="popup-location">{item.location}</div>
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt="Incident Evidence" 
                      className="popup-thumb"
                      style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "6px", marginTop: "6px" }}
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
