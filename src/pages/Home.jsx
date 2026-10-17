
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="welcome-page">
      <div className="welcome-glow welcome-glow-one" />
      <div className="welcome-glow welcome-glow-two" />

      <header className="welcome-header">
        <div className="welcome-brand">
          <div className="welcome-brand-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18" />
              <path d="M5 21V8l7-5 7 5v13" />
              <path d="M9 21v-6h6v6" />
              <path d="M9 10h.01M15 10h.01" />
            </svg>
          </div>
          <span>Municipal Services</span>
        </div>

        <span className="welcome-status">
          <span className="welcome-status-dot" />
          DIGITAL CIVIC SERVICES
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
            Municipal Complaint
            <span>Analyzer</span>
          </h1>

          <p className="welcome-description">
            A smarter way to report civic issues, track complaints,
            and help build a better community.
          </p>

          <div className="welcome-divider">
            <span />
            <span />
            <span />
          </div>

          <h2 className="welcome-prompt">Choose your portal</h2>
          <p className="welcome-hint">
            Select an option below to get started.
          </p>
        </div>

        <div className="portal-grid">
          <Link to="/citizen" className="portal-card citizen-card">
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
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                </svg>
              </div>
              <span className="portal-number">01</span>
            </div>

            <div className="portal-card-content">
              <span className="portal-label">FOR THE PUBLIC</span>
              <h3>Citizen Portal</h3>
              <p>
                Report a civic issue or follow the progress of
                a complaint you have already submitted.
              </p>
            </div>

            <div className="portal-card-footer">
              <span>Enter citizen portal</span>
              <span className="portal-arrow">↗</span>
            </div>
          </Link>

          <Link to="/authority" className="portal-card authority-card">
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
                  <path d="M3 21h18" />
                  <path d="M5 21V8l7-5 7 5v13" />
                  <path d="M9 21v-6h6v6" />
                  <path d="M9 10h.01M15 10h.01" />
                </svg>
              </div>
              <span className="portal-number">02</span>
            </div>

            <div className="portal-card-content">
              <span className="portal-label">FOR MUNICIPAL STAFF</span>
              <h3>Authority Portal</h3>
              <p>
                Review reported issues, manage complaint status,
                and monitor civic service requests.
              </p>
            </div>

            <div className="portal-card-footer">
              <span>Enter authority portal</span>
              <span className="portal-arrow">↗</span>
            </div>
          </Link>
        </div>

        <div className="welcome-bottom-note">
          <span className="welcome-note-icon">✳</span>
          <span>Every complaint is a step towards a better city.</span>
        </div>
      </section>

      <footer className="welcome-footer">
        <span>Municipal Complaint Analyzer</span>
        <span className="footer-separator">•</span>
        <span>Digital Civic Service Platform</span>
      </footer>
    </main>
  );
}
