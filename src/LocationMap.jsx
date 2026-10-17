import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(event) {
      setPosition([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function LocationMap({ position, setPosition }) {

  const defaultPosition = [8.5241, 76.9366];

  return (
    <div>
      <h3>Select Complaint Location</h3>

      <MapContainer
        center={defaultPosition}
        zoom={13}
        style={{
          height: "400px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker
          position={position}
          setPosition={setPosition}
        />
      </MapContainer>

      {position && (
        <p>
          Selected Location:{" "}
          {position[0].toFixed(6)},{" "}
          {position[1].toFixed(6)}
        </p>
      )}

      {!position && (
        <p>
          Click on the map to place the complaint location.
        </p>
      )}
    </div>
  );
}

export default LocationMap;