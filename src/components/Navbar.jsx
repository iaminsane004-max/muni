import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ArrowUpRight, 
  Menu, 
  X
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Overview" },
    { to: "/register-complaint", label: "Report Defect" },
    { to: "/track-complaint", label: "Track Status" },
    { to: "/authority", label: "Authority Board" },
  ];

  return (
    <header className="minimal-nav-container">
      <div className="minimal-nav-bar">
        {/* Left: Brand Logo */}
        <Link to="/" className="nav-brand-logo">
          <span className="nav-brand-dot" />
          <span className="nav-brand-text">CivicPulse</span>
        </Link>

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
