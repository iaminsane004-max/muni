import { useCallback, useEffect, useMemo, useState } from "react";
import "./AuthorityDashboard.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";

const API_BASE = "http://127.0.0.1:5000";
const STATUS_OPTIONS = ["Submitted", "In Progress", "Resolved", "Rejected"];

function formatDate(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const getStatusClass = (status) => {
  const normalizedStatus =
    typeof status === "string" ? status : "Submitted";

  return normalizedStatus.toLowerCase().replace(/\s+/g, "-");
};

const createComplaintIcon = (count) =>
  L.divIcon({
    className: "complaint-count-marker",
    html: `<div class="complaint-count-badge">${count}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

function AuthorityDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [impactFilter, setImpactFilter] = useState("All impact levels");
  const [updatingId, setUpdatingId] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchComplaints = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/complaints`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      setComplaints(Array.isArray(data) ? data : []);
      setLoadError("");
    } catch (error) {
      setLoadError("Couldn't connect to the backend. Make sure the Flask server is running on port 5000, then try again.");
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(fetchComplaints); }, [fetchComplaints]);

  const stats = useMemo(() => ({
    total: complaints.length,
    submitted: complaints.filter((item) => (item.status || "Submitted") === "Submitted").length,
    progress: complaints.filter((item) => item.status === "In Progress").length,
    resolved: complaints.filter((item) => item.status === "Resolved").length,
  }), [complaints]);

  const filteredComplaints = useMemo(() => {
    const term = search.trim().toLowerCase();
    return complaints.filter((item) => {
      const matchesSearch = !term || [item.id, item.description, item.location, item.population]
        .some((value) => String(value || "").toLowerCase().includes(term));
      const matchesStatus = statusFilter === "All statuses" || (item.status || "Submitted") === statusFilter;
      const matchesImpact = impactFilter === "All impact levels" || (item.population || "Not specified") === impactFilter;
      return matchesSearch && matchesStatus && matchesImpact;
    }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [complaints, search, statusFilter, impactFilter]);

  
const mapComplaints = useMemo(() => {
  return complaints.filter((item) => {
    const lat = Number(item.latitude);
    const lng = Number(item.longitude);

    return (
      item.latitude !== null &&
      item.latitude !== undefined &&
      item.latitude !== "" &&
      item.longitude !== null &&
      item.longitude !== undefined &&
      item.longitude !== "" &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= 8.2 &&
      lat <= 8.9 &&
      lng >= 76.5 &&
      lng <= 77.3
    );
  });
}, [complaints]);

const groupedMapComplaints = useMemo(() => {
  const groups = new Map();

  mapComplaints.forEach((complaint) => {
    const key = `${Number(complaint.latitude)},${Number(complaint.longitude)}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        latitude: Number(complaint.latitude),
        longitude: Number(complaint.longitude),
        complaints: [],
      });
    }

    groups.get(key).complaints.push(complaint);
  });

  return Array.from(groups.values());
}, [mapComplaints]);


  const updateStatus = async (complaint, status) => {
    if (status === complaint.status) return;
    setUpdatingId(complaint.id);
    setNotice("");
    try {
      const response = await fetch(`${API_BASE}/api/complaints/${encodeURIComponent(complaint.id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Status update failed");
      setComplaints((current) => current.map((item) => item.id === complaint.id ? { ...item, status } : item));
      setSelectedComplaint((current) => current?.id === complaint.id ? { ...current, status } : current);
      setNotice(`Complaint ${complaint.id} updated to ${status}.`);
    } catch (error) {
      setNotice(error.message || "Couldn't update status. Please try again.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <main className="authority-page">
      <div className="authority-topline">
        <div className="authority-brand">
          <div className="authority-brand-mark" aria-hidden="true">⌂</div>
          <div><span className="authority-eyebrow">MUNICIPAL SERVICES</span><strong>Operations Portal</strong></div>
        </div>
        <div className="authority-live"><span /> Complaint management</div>
      </div>

      <section className="authority-welcome">
        <div>
          <div className="authority-eyebrow">AUTHORITY WORKSPACE</div>
          <h1>Complaint dashboard</h1>
          <p>Review reports from your community, track progress, and keep every issue moving.</p>
        </div>
        <button className="authority-refresh" type="button" onClick={() => { setRefreshing(true); fetchComplaints(); }} disabled={loading || refreshing}>
          <span className={refreshing ? "refresh-symbol spinning" : "refresh-symbol"}>↻</span>
          {refreshing ? "Refreshing…" : "Refresh data"}
        </button>
      </section>

      {notice && <div className="authority-notice" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}

      <section className="authority-stats" aria-label="Complaint summary">
        <article className="authority-stat stat-total"><div className="stat-heading"><span>Total complaints</span><span className="stat-icon">▤</span></div><strong>{stats.total}</strong><small>All reports received</small></article>
        <article className="authority-stat stat-submitted"><div className="stat-heading"><span>Awaiting review</span><span className="stat-icon">◷</span></div><strong>{stats.submitted}</strong><small>Recently submitted</small></article>
        <article className="authority-stat stat-progress"><div className="stat-heading"><span>In progress</span><span className="stat-icon">↗</span></div><strong>{stats.progress}</strong><small>Being addressed</small></article>
        <article className="authority-stat stat-resolved"><div className="stat-heading"><span>Resolved</span><span className="stat-icon">✓</span></div><strong>{stats.resolved}</strong><small>Marked as complete</small></article>
      </section>

      <section className="authority-map-section">
  <div className="authority-map-header">
    <div>
      <h2>Complaint locations</h2>
      <p>Explore reported issues across Thiruvananthapuram.</p>
    </div>
    <span className="authority-count">
      {groupedMapComplaints.length} locations mapped
    </span>
  </div>

  {mapComplaints.length === 0 ? (
    <div className="authority-map-empty">
      No complaints with valid Thiruvananthapuram coordinates yet.
    </div>
  ) : (
    <MapContainer
      center={[8.52, 76.94]}
      zoom={10}
      minZoom={9}
      maxZoom={17}
      maxBounds={[[8.2, 76.5], [8.9, 77.3]]}
      maxBoundsViscosity={1}
      className="authority-map"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      

{groupedMapComplaints.map((group) => (
  <Marker
    key={group.key}
    position={[group.latitude, group.longitude]}
    icon={createComplaintIcon(group.complaints.length)}
  >
    <Popup>
      <div className="authority-map-popup">
        <strong>
          {group.complaints.length} complaint
          {group.complaints.length === 1 ? "" : "s"} at this location
        </strong>

        <p>
          {group.complaints[0].location || "Location not provided"}
        </p>

        {group.complaints.map((complaint) => (
          <div key={complaint.id}>
            <hr />
            <strong>{complaint.id}</strong>
            <p>{complaint.description || "No description provided."}</p>
            <p>
              <b>Status:</b> {complaint.status || "Submitted"}
            </p>
            <button
              type="button"
              className="details-button"
              onClick={() => setSelectedComplaint(complaint)}
            >
              View full details ↗
            </button>
          </div>
        ))}
      </div>
    </Popup>
  </Marker>
))}

 </MapContainer>
  )}
</section>

      <section className="authority-worklist">
        <div className="authority-worklist-header">
          <div><h2>Reported issues</h2><p>Search, filter, and update the status of each complaint.</p></div>
          <span className="authority-count">{filteredComplaints.length} shown</span>
        </div>
        <div className="authority-filters">
          <label className="authority-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID, description or location…" aria-label="Search complaints" /></label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
            <option>All statuses</option>{STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
          </select>
          <select value={impactFilter} onChange={(event) => setImpactFilter(event.target.value)} aria-label="Filter by affected population">
            <option>All impact levels</option>
            {[...new Set(complaints.map((item) => item.population).filter(Boolean))].sort().map((impact) => <option key={impact}>{impact}</option>)}
          </select>
          {(search || statusFilter !== "All statuses" || impactFilter !== "All impact levels") && <button className="authority-clear" type="button" onClick={() => { setSearch(""); setStatusFilter("All statuses"); setImpactFilter("All impact levels"); }}>Clear</button>}
        </div>

        {loading && complaints.length === 0 ? <div className="authority-state"><div className="authority-loader" /><strong>Loading complaints</strong><p>Fetching the latest reports from the municipal database…</p></div> : loadError ? <div className="authority-state authority-error"><div className="state-symbol">!</div><strong>Dashboard couldn't load</strong><p>{loadError}</p><button type="button" className="authority-refresh" onClick={fetchComplaints}>Try again</button></div> : filteredComplaints.length === 0 ? <div className="authority-state"><div className="state-symbol">⌕</div><strong>{complaints.length ? "No matching complaints" : "No complaints yet"}</strong><p>{complaints.length ? "Try changing your search or filters." : "New citizen submissions will appear here."}</p></div> : (
          <div className="authority-table-wrap"><table className="authority-table"><thead><tr><th>Complaint</th><th>Location</th><th>Impact</th><th>Reported on</th><th>Status</th><th>Details</th></tr></thead><tbody>
            {filteredComplaints.map((complaint) => <tr key={complaint.id}>
              <td><div className="complaint-cell"><span className="complaint-avatar">{String(complaint.id || "C").slice(-2, -1) || "C"}</span><div><strong>{complaint.id}</strong><p>{complaint.description || "No description provided"}</p>{complaint.image_filename && <span className="evidence-tag">▧ Evidence attached</span>}</div></div></td>
              <td><div className="location-cell"><span>⌖</span><span>{complaint.location || "Location not provided"}</span></div></td>
              <td><span className={`impact-pill impact-${String(complaint.population || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{complaint.population || "Not specified"}</span></td>
              <td className="date-cell">{formatDate(complaint.date)}</td>
              <td><label className="status-select-label"><span className={`status-dot status-dot-${getStatusClass(complaint.status)}`} /><select className={`status-select status-${getStatusClass(complaint.status)}`} value={complaint.status || "Submitted"} disabled={updatingId === complaint.id} onChange={(event) => updateStatus(complaint, event.target.value)} aria-label={`Update status for ${complaint.id}`}>{STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}</select></label>{updatingId === complaint.id && <small className="updating-label">Saving…</small>}</td>
              <td><button className="details-button" type="button" onClick={() => setSelectedComplaint(complaint)}>View details <span>↗</span></button></td>
            </tr>)}
          </tbody></table></div>
        )}
        <div className="authority-worklist-footer"><span>Keep complaint statuses up to date for clear community follow-up.</span><span>Showing {filteredComplaints.length} of {complaints.length}</span></div>
      </section>
      <footer className="authority-footer"><span>AI Municipal Complaint Analyzer</span><span>Community issues, managed clearly.</span></footer>

      {selectedComplaint && <div className="complaint-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedComplaint(null); }}>
        <section className="complaint-modal" role="dialog" aria-modal="true" aria-labelledby="complaint-modal-title">
          <div className="complaint-modal-header"><div><span className="authority-eyebrow">COMPLAINT DETAILS</span><h2 id="complaint-modal-title">{selectedComplaint.id}</h2></div><button type="button" className="modal-close" onClick={() => setSelectedComplaint(null)} aria-label="Close details">×</button></div>
          <div className="complaint-modal-body"><div className="modal-field"><span>Description</span><p>{selectedComplaint.description || "No description provided."}</p></div><div className="modal-field"><span>Location</span><p>{selectedComplaint.location || "Not provided"}</p></div><div className="modal-detail-grid"><div className="modal-field"><span>Affected population</span><p>{selectedComplaint.population || "Not specified"}</p></div><div className="modal-field"><span>Date reported</span><p>{formatDate(selectedComplaint.date)}</p></div><div className="modal-field"><span>Latitude</span><p>{selectedComplaint.latitude ?? "—"}</p></div><div className="modal-field"><span>Longitude</span><p>{selectedComplaint.longitude ?? "—"}</p></div></div>
            <div className="modal-field"><span>Update status</span><select className={`status-select status-${getStatusClass(selectedComplaint.status)}`} value={selectedComplaint.status || "Submitted"} disabled={updatingId === selectedComplaint.id} onChange={(event) => updateStatus(selectedComplaint, event.target.value)}>{STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}</select></div>
            {selectedComplaint.image_filename && <div className="modal-field"><span>Attached evidence</span><a className="evidence-link" href={`${API_BASE}/uploads/${encodeURIComponent(selectedComplaint.image_filename)}`} target="_blank" rel="noreferrer"><img src={`${API_BASE}/uploads/${encodeURIComponent(selectedComplaint.image_filename)}`} alt={`Evidence for ${selectedComplaint.id}`} /><span>Open full image ↗</span></a></div>}
          </div><div className="complaint-modal-footer"><button type="button" className="authority-refresh" onClick={() => setSelectedComplaint(null)}>Close details</button></div>
        </section>
      </div>}
    </main>
  );
}

export default AuthorityDashboard;
