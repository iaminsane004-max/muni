
import { Link } from "react-router-dom";

export default function CitizenPortal() {
  return (
    <main className="welcome-page citizen-portal-page">
      <header className="welcome-header">
        <Link to="/" className="welcome-brand citizen-back-link">
          <div className="welcome-brand-icon">
            <span>←</span>
          </div>
          <span>Back to Home</span>
        </Link>

        <span className="welcome-status">
          <span className="welcome-status-dot" />
          CITIZEN SERVICES
        </span>
      </header>

      <section className="welcome-main">
        <div className="welcome-content">
          <div className="welcome-eyebrow">
            <span className="welcome-eyebrow-line" />
            YOUR CITY, YOUR VOICE
            <span className="welcome-eyebrow-line" />
          </div>

          <h1 className="welcome-title">
            Citizen
            <span>Portal</span>
          </h1>

          <p className="welcome-description">
            We're here to help you report civic issues and
            stay informed about the complaints you submit.
          </p>

          <div className="welcome-divider">
            <span />
            <span />
            <span />
          </div>

          <h2 className="welcome-prompt">How can we help you today?</h2>
          <p className="welcome-hint">
            Choose a service to continue.
          </p>
        </div>

        <div className="portal-grid">
          <Link
            to="/register-complaint"
            className="portal-card citizen-card"
          >
            <div className="portal-card-top">
              <div className="portal-icon authority-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                </svg>
              </div>
              <span className="portal-number">01</span>
            </div>

            <div className="portal-card-content">
              <span className="portal-label">REPORT AN ISSUE</span>
              <h3>Register New Complaint</h3>
              <p>
                Submit a civic complaint, describe the issue,
                upload supporting evidence, and mark its location.
              </p>
            </div>

            <div className="portal-card-footer">
              <span>Register a complaint</span>
              <span className="portal-arrow">↗</span>
            </div>
          </Link>

          <Link
            to="/track-complaint"
            className="portal-card authority-card"
          >
            <div className="portal-card-top">
              <div className="portal-icon citizen-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="m16 16 4.5 4.5" />
                  <path d="M8 10.5h5M10.5 8v5" />
                </svg>
              </div>
              <span className="portal-number">02</span>
            </div>

            <div className="portal-card-content">
              <span className="portal-label">CHECK PROGRESS</span>
              <h3>Track My Complaint</h3>
              <p>
                Look up a previously submitted complaint and
                check its progress using your complaint ID.
              </p>
            </div>

            <div className="portal-card-footer">
              <span>Track complaint status</span>
              <span className="portal-arrow">↗</span>
            </div>
          </Link>
        </div>

        <div className="welcome-bottom-note">
          <span className="welcome-note-icon">✳</span>
          <span>Your civic concerns matter. We're here to help.</span>
        </div>
      </section>

      <footer className="welcome-footer">
        <span>Municipal Complaint Analyzer</span>
        <span className="footer-separator">•</span>
        <span>Citizen Services Portal</span>
      </footer>
    </main>
  );
}
