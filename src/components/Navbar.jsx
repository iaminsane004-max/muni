import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Copy, 
  Check, 
  ArrowUpRight, 
  Menu, 
  X,
  ShieldCheck
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@civicpulse.city");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navLinks = [
    { to: "/", label: "Overview" },
    { to: "/register-complaint", label: "Report Defect" },
    { to: "/track-complaint", label: "Track Status" },
    { to: "/authority", label: "Authority Board" },
  ];

  return (
    <header className="minimal-nav-container">
      <div className="minimal-nav-bar">
        {/* Left: Email / Contact Pill with Copy button */}
        <div className="nav-left-pill-group">
          <span className="nav-email-text">civic.triage@city.gov</span>
          <button 
            type="button" 
            className="nav-tiny-pill-btn" 
            onClick={handleCopyEmail}
            title="Copy Civic Email"
          >
            {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <span className="nav-status-badge">
            <span className="status-dot-green" />
            <span>AI Active</span>
          </span>
        </div>

        {/* Center: Clean Text Navigation */}
        <nav className="nav-center-links">
          {navLinks.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link 
                key={item.to} 
                to={item.to} 
                className={`nav-text-item ${active ? "active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Pill Action Buttons */}
        <div className="nav-right-actions">
          <Link to="/register-complaint" className="nav-black-pill-btn">
            <span>Report Defect</span>
            <ArrowUpRight size={14} />
          </Link>

          <button 
            className="nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="nav-mobile-drawer">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-mobile-link ${location.pathname === item.to ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/register-complaint"
            className="nav-mobile-action-btn"
            onClick={() => setMobileOpen(false)}
          >
            <span>Report Defect</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      )}
    </header>
  );
}
