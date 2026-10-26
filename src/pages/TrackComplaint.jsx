import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Calendar,
  FileText
} from "lucide-react";
import InteractiveMap from "../components/InteractiveMap";
import { fetchComplaintById } from "../services/supabase";

export default function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id") || "";

  const [complaintId, setComplaintId] = useState(queryId);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (idToSearch) => {
    const target = (idToSearch || complaintId).trim();
    if (!target) return;

    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      const data = await fetchComplaintById(target);
      if (!data) {
        setError(`No complaint found with Reference ID "${target}". Please verify the code and try again.`);
      } else {
        setComplaint(data);
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setError("An error occurred while fetching complaint data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setComplaintId(queryId);
      handleLookup(queryId);
    }
  }, [queryId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLookup(complaintId);
  };

  const getTimelineSteps = (status) => {
    const normalized = (status || "Submitted").toLowerCase();
    
    if (normalized === "rejected") {
      return [
        { label: "Submitted", done: true },
        { label: "AI Triaged", done: true },
        { label: "Review Completed", done: true },
        { label: "Rejected / Duplicate", done: true, isRejected: true }
      ];
    }

    return [
      { label: "Submitted", done: true },
      { label: "AI Triage & Classification", done: true },
      { label: "Department In Action", done: normalized === "in progress" || normalized === "resolved" },
      { label: "Verified & Resolved", done: normalized === "resolved" }
    ];
  };

  return (
    <div className="track-container">
      <div className="page-header-block">
        <div className="header-tag">
          <Search size={14} className="text-blue-400" />
          <span>CIVIC STATUS TRACKER</span>
        </div>
        <h1>Track Your Complaint Progress</h1>
        <p>Enter your unique Reference ID to check live inspection milestones and official responses</p>
      </div>

      {/* Search Bar */}
      <div className="track-search-card">
        <form onSubmit={handleSubmit} className="track-search-form">
          <div className="search-input-wrap">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="E.g. CMP-20261026-8801" 
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="track-submit-btn" disabled={loading}>
            {loading ? "Searching..." : "Track Status"}
          </button>
        </form>

        <div className="quick-suggestions">
          <span className="text-xs text-slate-400">Sample Reference IDs:</span>
          {["CMP-20261026-8801", "CMP-20261026-6412", "CMP-20261025-3319"].map((sampleId) => (
            <button 
              key={sampleId} 
              type="button" 
              className="sample-id-chip"
              onClick={() => {
                setComplaintId(sampleId);
                handleLookup(sampleId);
              }}
            >
              {sampleId}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-alert-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Complaint Details Card */}
      {complaint && (
        <div className="tracker-result-wrapper">
          {/* Milestone Stepper */}
          <div className="milestone-timeline-card">
            <h3>Lifecycle Milestones</h3>
            <div className="stepper-track">
              {getTimelineSteps(complaint.status).map((step, idx) => (
                <div key={idx} className={`stepper-node ${step.done ? "completed" : "pending"} ${step.isRejected ? "rejected" : ""}`}>
                  <div className="stepper-dot">
                    {step.done ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span className="stepper-label">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="complaint-detail-grid">
            {/* Left Column: Complaint Info */}
            <div className="complaint-info-col">
              <div className="info-card">
                <div className="info-card-header">
                  <div>
                    <span className="reference-pill">{complaint.id}</span>
                    <h2 className="info-title">{complaint.title || complaint.description.slice(0, 50)}</h2>
                  </div>
                  <span className={`status-pill status-${(complaint.status || "submitted").toLowerCase().replace(/\s+/g, "-")}`}>
                    {complaint.status}
                  </span>
                </div>

                <div className="meta-badges-row">
                  <span className="meta-badge category">{complaint.category}</span>
                  <span className={`meta-badge severity-${(complaint.severity || "medium").toLowerCase()}`}>
                    {complaint.severity} Severity
                  </span>
                  <span className="meta-badge priority">
                    {complaint.priority} Priority
                  </span>
                </div>

                <div className="description-box">
                  <h4>Citizen Description:</h4>
                  <p>{complaint.description}</p>
                </div>

                {complaint.urgency_reasons && complaint.urgency_reasons.length > 0 && (
                  <div className="urgency-factors-box">
                    <div className="urgency-title">
                      <ShieldAlert size={14} className="text-amber-400" />
                      <span>AI Triage Urgency Triggers:</span>
                    </div>
                    <ul className="urgency-list">
                      {complaint.urgency_reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Authority Update */}
                <div className="authority-update-box">
                  <div className="auth-box-header">
                    <Building2 size={16} className="text-blue-400" />
                    <strong>Official Action & Department Remarks</strong>
                  </div>
                  <div className="auth-dept-tag">
                    Department: <span>{complaint.department || "Municipal Public Works"}</span>
                  </div>
                  <p className="auth-notes-text">
                    {complaint.official_notes || "Awaiting initial site inspection report from zonal office."}
                  </p>
                  <div className="auth-time-stamp">
                    <Clock size={12} />
                    <span>Last Updated: {new Date(complaint.updated_at || complaint.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {complaint.image_url && (
                  <div className="evidence-section">
                    <h4>Uploaded Photographic Evidence:</h4>
                    <img 
                      src={complaint.image_url} 
                      alt="Complaint Evidence" 
                      className="evidence-display-img"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Geolocation Map */}
            <div className="complaint-map-col">
              <div className="info-card">
                <h3>Incident Location</h3>
                <div className="location-address-box">
                  <MapPin size={16} className="text-rose-400 flex-shrink-0" />
                  <span>{complaint.location}</span>
                </div>

                {complaint.latitude && complaint.longitude ? (
                  <div className="detail-map-wrapper">
                    <InteractiveMap 
                      center={[Number(complaint.latitude), Number(complaint.longitude)]}
                      zoom={15}
                      selectedPosition={[Number(complaint.latitude), Number(complaint.longitude)]}
                      height="300px"
                    />
                  </div>
                ) : (
                  <div className="no-coords-notice">
                    No precise GPS coordinates were attached to this report.
                  </div>
                )}

                <div className="tracking-summary-footer">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={13} />
                    <span>Logged on: {new Date(complaint.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <FileText size={13} />
                    <span>Reported by: {complaint.citizen_name || "Anonymous"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}