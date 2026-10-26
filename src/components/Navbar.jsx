import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Building2, 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  Menu, 
  X
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Overview", icon: Building2 },
    { to: "/register-complaint", label: "Report Issue", icon: PlusCircle },
    { to: "/track-complaint", label: "Track Status", icon: Search },
    { to: "/authority", label: "Authority Command", icon: ShieldCheck },
  ];

  return (
    <header className="site-navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-badge">
          <div className="brand-logo-glow">
            <Building2 className="brand-logo-icon" size={22} />
          </div>
          <div className="brand-text-block">
            <div className="brand-title">
              CivicPulse <span className="brand-ai-tag">AI</span>
            </div>
            <div className="brand-subtitle">Municipal Complaint & Triage Engine</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-links">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link 
                key={item.to} 
                to={item.to} 
                className={`nav-link-item ${active ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Toggle */}
        <div className="navbar-actions">
          <button 
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-links-list">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`mobile-nav-item ${active ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
