import { useState, useId } from "react";
import { Link } from "react-router-dom";
import { 
  PlusCircle, 
  MapPin, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Navigation, 
  UploadCloud, 
  X, 
  Clock, 
  Building2,
  User,
  Phone,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import InteractiveMap from "../components/InteractiveMap";
import { analyzeComplaintText } from "../services/aiAnalyzer";
import { submitNewComplaint } from "../services/supabase";

export default function RegisterComplaint() {
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });
  const [population, setPopulation] = useState("Medium");
  const [citizenName, setCitizenName] = useState("");
  const [citizenContact, setCitizenContact] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Real-time AI Analysis of the text
  const aiAnalysis = analyzeComplaintText(description);

  // Handle Photo selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Reverse Geocoding via Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "en" } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          setLocationName(data.display_name);
        }
      }
    } catch (err) {
      console.warn("Address lookup failed:", err);
    }
  };

  // Handle user clicking on the map
  const handleMapLocationSelect = (lat, lng) => {
    setCoordinates({ lat, lng });
    reverseGeocode(lat, lng);
  };

  // HTML5 Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoordinates({ lat, lng });
        reverseGeocode(lat, lng);
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        alert("Could not detect precise GPS location. You can click on the map or type your address manually.");
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage("Please describe the municipal issue before submitting.");
      return;
    }
    if (!locationName.trim()) {
      setErrorMessage("Please provide the location or address of the incident.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedId = `CMP-${dateStr}-${randomSuffix}`;

      const payload = {
        id: generatedId,
        title: description.slice(0, 60) + (description.length > 60 ? "..." : ""),
        description: description.trim(),
        category: aiAnalysis.category,
        severity: aiAnalysis.severity,
        priority: aiAnalysis.priority,
        ai_confidence: aiAnalysis.categoryConfidence,
        urgency_reasons: aiAnalysis.urgencyReasons,
        location: locationName.trim(),
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        population,
        department: aiAnalysis.department,
        citizen_name: citizenName.trim() || "Anonymous Citizen",
        citizen_contact: citizenContact.trim() || "Not provided",
      };

      const result = await submitNewComplaint(payload, imageFile);
      if (result.success) {
        setSubmittedResult(result.complaint);
      } else {
        throw new Error(result.message || "Failed to submit complaint.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage(err.message || "An unexpected error occurred while saving. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyId = () => {
    if (submittedResult?.id) {
      navigator.clipboard.writeText(submittedResult.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // If already submitted, display Success Ticket Card
  if (submittedResult) {
    return (
      <div className="registration-success-container">
        <div className="success-ticket-card">
          <div className="success-header">
            <div className="success-icon-badge">
              <CheckCircle2 size={36} className="text-emerald-400" />
            </div>
            <h2>Complaint Registered Successfully!</h2>
            <p>Your issue has been logged into the municipal dispatch system.</p>
          </div>

          <div className="reference-code-box">
            <span className="code-label">Complaint Reference ID</span>
            <div className="code-row">
              <span className="code-value">{submittedResult.id}</span>
              <button className="copy-btn" onClick={copyId}>
                <Copy size={16} />
                <span>{copiedId ? "Copied!" : "Copy ID"}</span>
              </button>
            </div>
          </div>

          <div className="ticket-details-grid">
            <div className="ticket-item">
              <span className="ticket-label">Category</span>
              <span className="ticket-val">{submittedResult.category}</span>
            </div>
            <div className="ticket-item">
              <span className="ticket-label">Assigned Department</span>
              <span className="ticket-val">{submittedResult.department}</span>
            </div>
            <div className="ticket-item">
              <span className="ticket-label">Severity Level</span>
              <span className={`severity-badge severity-${(submittedResult.severity || "medium").toLowerCase()}`}>
                {submittedResult.severity}
              </span>
            </div>
            <div className="ticket-item">
              <span className="ticket-label">Target Resolution SLA</span>
              <span className="ticket-val font-medium">{aiAnalysis.estimatedSla}</span>
            </div>
          </div>

          <div className="ticket-actions">
            <Link 
              to={`/track-complaint?id=${submittedResult.id}`} 
              className="btn-primary-glow w-full justify-center"
            >
              <span>Track This Complaint Now</span>
              <ArrowRight size={16} />
            </Link>

            <button 
              className="btn-secondary-glass w-full"
              onClick={() => {
                setSubmittedResult(null);
                setDescription("");
                setLocationName("");
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              Register Another Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="page-header-block">
        <div className="header-tag">
          <PlusCircle size={14} className="text-blue-400" />
          <span>CITIZEN COMPLAINT REGISTRATION</span>
        </div>
        <h1>Report a Municipal Issue</h1>
        <p>Submit civic defects with automatic AI category triage, hazard detection, and GPS pin</p>
      </div>

      {errorMessage && (
        <div className="error-alert-banner">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form className="complaint-form" onSubmit={handleSubmit}>
        <div className="form-layout-grid">
          {/* Left Column: Details & AI Triage */}
          <div className="form-left-col">
            {/* Description Input */}
            <div className="form-card">
              <div className="card-heading">
                <span className="step-num">1</span>
                <h3>Describe the Incident or Defect</h3>
              </div>
              <p className="field-hint">
                Provide details such as broken pipes, live wires, potholes, garbage dumps, or flooded roads.
              </p>

              <textarea 
                className="complaint-textarea"
                rows={5}
                placeholder="E.g., A high voltage electrical wire snapped and is lying across the road outside Greenfield Public School. Sparks are flying and kids are nearby..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              {/* Real-time AI Triage Inspector */}
              <div className="ai-inspector-card">
                <div className="ai-inspector-header">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-400" />
                    <strong>Real-Time AI Classification</strong>
                  </div>
                  <span className="ai-confidence-pill">
                    {Math.round(aiAnalysis.categoryConfidence * 100)}% Match
                  </span>
                </div>

                <div className="ai-preview-grid">
                  <div className="ai-preview-item">
                    <span className="preview-label">Category</span>
                    <span className="preview-value category-tag">{aiAnalysis.category}</span>
                  </div>

                  <div className="ai-preview-item">
                    <span className="preview-label">Severity Level</span>
                    <span className={`severity-tag severity-${aiAnalysis.severity.toLowerCase()}`}>
                      {aiAnalysis.severity}
                    </span>
                  </div>

                  <div className="ai-preview-item">
                    <span className="preview-label">Priority Queue</span>
                    <span className="preview-value">{aiAnalysis.priority}</span>
                  </div>

                  <div className="ai-preview-item">
                    <span className="preview-label">Routing Dept</span>
                    <span className="preview-value text-xs">{aiAnalysis.department}</span>
                  </div>
                </div>

                {aiAnalysis.urgencyReasons.length > 0 && (
                  <div className="urgency-factors-box">
                    <div className="urgency-title">
                      <ShieldAlert size={14} className="text-amber-400" />
                      <span>Triggered Urgency Safety Rules:</span>
                    </div>
                    <ul className="urgency-list">
                      {aiAnalysis.urgencyReasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Photo Evidence Upload */}
            <div className="form-card">
              <div className="card-heading">
                <span className="step-num">2</span>
                <h3>Photo Evidence (Optional)</h3>
              </div>
              <p className="field-hint">Upload a photo to help dispatch crews verify the situation quickly.</p>

              {imagePreview ? (
                <div className="image-preview-wrapper">
                  <img src={imagePreview} alt="Evidence Preview" className="evidence-preview-img" />
                  <button type="button" className="remove-img-btn" onClick={handleRemoveImage}>
                    <X size={16} /> Remove
                  </button>
                </div>
              ) : (
                <label className="dropzone-area">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                  <div className="dropzone-content">
                    <UploadCloud size={32} className="text-slate-400 mb-2" />
                    <span className="dropzone-title">Click or drag image file here</span>
                    <span className="dropzone-sub">Supports JPG, PNG, WEBP (Max 10MB)</span>
                  </div>
                </label>
              )}
            </div>

            {/* Contact Information (Optional) */}
            <div className="form-card">
              <div className="card-heading">
                <span className="step-num">3</span>
                <h3>Citizen Contact (Optional)</h3>
              </div>
              <div className="form-grid-2">
                <div className="input-field">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Anand Sharma (or leave blank for Anonymous)"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label>Phone or Email</label>
                  <input 
                    type="text" 
                    placeholder="+91 98765 43210 or email"
                    value={citizenContact}
                    onChange={(e) => setCitizenContact(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Location & Map Pin */}
          <div className="form-right-col">
            <div className="form-card sticky-card">
              <div className="card-heading">
                <span className="step-num">4</span>
                <h3>Incident Location & Pinpoint</h3>
              </div>
              <p className="field-hint">
                Specify street address or click anywhere on the map to drop the incident pin.
              </p>

              <div className="location-action-bar">
                <input 
                  type="text" 
                  className="location-text-input"
                  placeholder="Type address, landmark, or ward name..."
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="detect-gps-btn"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  title="Detect GPS location from browser"
                >
                  <Navigation size={15} />
                  <span>{locating ? "Locating..." : "Use GPS"}</span>
                </button>
              </div>

              <div className="map-picker-container">
                <InteractiveMap 
                  center={[coordinates.lat, coordinates.lng]}
                  zoom={14}
                  selectedPosition={[coordinates.lat, coordinates.lng]}
                  onLocationSelect={handleMapLocationSelect}
                  height="340px"
                />
                <div className="map-coords-badge">
                  <MapPin size={12} />
                  <span>Lat: {coordinates.lat.toFixed(5)}, Lng: {coordinates.lng.toFixed(5)}</span>
                </div>
              </div>

              {/* Estimated Impact */}
              <div className="impact-selector-block">
                <label>Affected Population Scale</label>
                <div className="impact-options-row">
                  {["Low", "Medium", "High"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`impact-choice-btn ${population === lvl ? "selected" : ""}`}
                      onClick={() => setPopulation(lvl)}
                    >
                      {lvl === "Low" ? "Local / Household" : lvl === "Medium" ? "Neighborhood / Ward" : "Critical Thoroughfare"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button 
                type="submit" 
                className="submit-complaint-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="submit-spinner" />
                    <span>Transmitting to Supabase...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} />
                    <span>Submit Complaint for Triage</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
