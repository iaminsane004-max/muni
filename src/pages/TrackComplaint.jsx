import { useState } from "react";
import { Link } from "react-router-dom";

function TrackComplaint() {
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const id = complaintId.trim();

    if (!id) return;

    setLoading(true);
    setComplaint(null);
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/complaints/${encodeURIComponent(id)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to find this complaint."
        );
      }

      setComplaint(data);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    if (typeof status === "string" && status.trim()) {
      return status
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    return "Submitted";
  };

  return (
    <div className="track-page">
      <section className="page-intro">
        <p className="page-eyebrow">COMPLAINT SERVICES</p>
        <h1>Track Your Complaint</h1>
        <p>
          Follow up on a civic issue using the complaint
          reference ID you received after submission.
        </p>
      </section>

      <main className="tracking-page-container">
        <div className="tracking-icon">
          <span>01</span>
        </div>

        <h2>Check Complaint Status</h2>

        <p className="tracking-description">
          Enter your complaint reference ID below to look up
          its current status.
        </p>

        <form
          className="tracking-page-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="complaintId">
            Complaint Reference ID
          </label>

          <input
            type="text"
            id="complaintId"
            name="complaintId"
            placeholder="e.g. CMP-20261014-1234"
            value={complaintId}
            onChange={(event) =>
              setComplaintId(event.target.value)
            }
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Check Status"}
          </button>
        </form>

        {error && (
          <div className="tracking-result tracking-error" role="alert">
            <h3>Complaint Not Found</h3>
            <p>{error}</p>
            <p>Please check your reference ID and try again.</p>
          </div>
        )}

        {complaint && (
          <div className="tracking-result tracking-success">
            <h3>Complaint Details</h3>

            <p>
              <strong>Reference ID:</strong>{" "}
              {complaint.id}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className="tracking-status">
                {formatStatus(complaint.status)}
              </span>
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {complaint.description || "Not available"}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {complaint.location || "Not available"}
            </p>

            <p>
              <strong>Date Submitted:</strong>{" "}
              {complaint.date || "Not available"}
            </p>
          </div>
        )}

        <div className="tracking-help">
          <h3>Where can I find my complaint ID?</h3>
          <p>
            Your reference ID is displayed after a complaint
            is submitted successfully. Keep it safe for future
            status enquiries.
          </p>
        </div>

        <div className="tracking-register-link">
          <span>Haven't reported an issue yet?</span>
          <Link to="/register-complaint">
            Register a new complaint
          </Link>
        </div>
      </main>

      <footer className="home-footer">
        <div>
          <strong>AI Municipal Complaint Analyzer</strong>
          <p>Working towards better municipal services.</p>
        </div>

        <Link to="/">Back to Home</Link>
      </footer>
    </div>
  );
}

export default TrackComplaint;