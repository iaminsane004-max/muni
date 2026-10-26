import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Leaf, 
  Search, 
  ShieldCheck, 
  PlusCircle, 
  Menu, 
  X,
  Lock
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/register-complaint", label: "Report Issue" },
    { to: "/track-complaint", label: "Track Status" },
    { to: "/authority", label: "Authority Council" },
  ];

  return (
    <header className="eco-navbar-wrap">
      <nav className="eco-navbar">
        {/* Brand Logo */}
        <Link to="/" className="eco-brand">
          <span className="eco-brand-name">Poulls<span className="brand-dot">.</span></span>
          <span className="eco-brand-sub">CivicPulse</span>
        </Link>

        {/* Center Links */}
        <div className="eco-nav-links">
          {navLinks.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link 
                key={item.to} 
                to={item.to} 
                className={`eco-nav-item ${active ? "active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="eco-nav-actions">
          <Link to="/track-complaint" className="eco-search-btn" title="Search Complaint">
            <Search size={16} />
          </Link>

          <Link to="/authority" className="eco-pill-btn">
            <Lock size={13} />
            <span>Council Portal</span>
          </Link>

          <button 
            className="eco-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="eco-mobile-drawer">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`eco-mobile-item ${location.pathname === item.to ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/register-complaint"
            className="eco-mobile-pill-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            <PlusCircle size={16} />
            <span>Report Civic Defect</span>
          </Link>
        </div>
      )}
    </header>
  );
}
