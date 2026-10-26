import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Leaf, 
  MapPin, 
  Search, 
  ArrowRight, 
  User, 
  ShieldCheck, 
  Sparkles,
  TreePine,
  CheckCircle2,
  Clock,
  Layers
} from "lucide-react";
import { fetchAllComplaints } from "../services/supabase";

export default function Home() {
  const navigate = useNavigate();
  const [quickCategory, setQuickCategory] = useState("All");
  const [quickLocation, setQuickLocation] = useState("");
  const [stats, setStats] = useState({ total: 0, resolved: 0, inProgress: 0 });

  useEffect(() => {
    async function loadStats() {
      const { complaints } = await fetchAllComplaints();
      const total = complaints.length;
      const resolved = complaints.filter(c => c.status === "Resolved").length;
      const inProgress = complaints.filter(c => c.status === "In Progress").length;
      setStats({ total, resolved, inProgress });
    }
    loadStats();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickLocation.trim()) {
      navigate(`/authority?search=${encodeURIComponent(quickLocation)}`);
    } else {
      navigate("/register-complaint");
    }
  };

  return (
    <div className="eco-home-content">
      {/* 1. Hero Landscape Section */}
      <section className="eco-hero-card">
        {/* Background Image Container */}
        <div className="eco-hero-bg">
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=85" 
            alt="Eco-Friendly Community Landscape" 
            className="eco-hero-img"
          />
          <div className="eco-hero-overlay" />
        </div>

        {/* Hero Overlay Text */}
        <div className="eco-hero-content">
          <div className="eco-hero-tag">
            <span className="eco-tag-dot" />
            <Leaf size={13} className="text-emerald-300" />
            <span>Green Civic Action</span>
          </div>

          <h1 className="eco-hero-title">
            Find Eco-Friendly <br />
            Homes & Cities Easily
          </h1>

          <p className="eco-hero-sub">
            Your one-stop AI municipal complaint analyzer. Report damaged roads, 
            water main leaks, and safety hazards to keep our public spaces thriving.
          </p>

          <div className="eco-hero-actions">
            <Link to="/register-complaint" className="eco-hero-btn">
              <span>Report Issue</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Overlapping Floating Search / Filter Bar */}
      <div className="eco-floating-search-wrap">
        <form className="eco-floating-search-bar" onSubmit={handleQuickSearch}>
          <div className="eco-search-col">
            <label className="eco-field-label">Issue Category</label>
            <select 
              value={quickCategory} 
              onChange={(e) => setQuickCategory(e.target.value)}
              className="eco-search-input"
            >
              <option value="All">All Categories</option>
              <option value="Roads">Roads & Potholes</option>
              <option value="Water">Water & Sewage</option>
              <option value="Power">Electricity & Lighting</option>
              <option value="Sanitation">Garbage & Sanitation</option>
            </select>
          </div>

          <div className="eco-search-divider" />

          <div className="eco-search-col flex-1">
            <label className="eco-field-label">Location or Ward</label>
            <input 
              type="text" 
              placeholder="e.g. Market Road, Ward 14..."
              value={quickLocation}
              onChange={(e) => setQuickLocation(e.target.value)}
              className="eco-search-input"
            />
          </div>

          <div className="eco-search-icons">
            <span className="eco-icon-circle"><User size={15} /></span>
            <span className="eco-icon-circle"><Search size={15} /></span>
            <span className="eco-status-counter" title="Total Active">{stats.total}</span>
          </div>

          <button type="submit" className="eco-submit-pill-btn">
            <span>Inspect</span>
          </button>
        </form>
      </div>

      {/* 3. Welcome / Mission Section (Two Columns) */}
      <section className="eco-welcome-section">
        <div className="eco-welcome-grid">
          {/* Left: Inset Photo with Circular Badges */}
          <div className="eco-welcome-visual">
            <div className="eco-image-frame">
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80" 
                alt="Municipal Community Space" 
                className="eco-welcome-img"
              />

              {/* Floating Green Circle Badge on Top Left */}
              <div className="eco-badge-circle top-left">
                <Leaf size={16} />
                <span>100% Civic Focus</span>
              </div>

              {/* Floating Orange Leaf Badge on Bottom Right */}
              <div className="eco-badge-circle bottom-right accent">
                <Sparkles size={16} />
              </div>
            </div>
          </div>

          {/* Right: Descriptive Content */}
          <div className="eco-welcome-info">
            <h2 className="eco-welcome-heading">Welcome on CivicPulse?</h2>
            <p className="eco-welcome-text">
              We empower citizens and municipal councils to maintain clean, 
              sustainable, and well-functioning neighborhoods. With instant AI defect triage, 
              automatic hazard detection, and transparent tracking, every report reaches 
              the right department within minutes.
            </p>
            <p className="eco-welcome-subtext">
              From restoring fresh water supply lines to fixing deep potholes and hazardous electrical lines, 
              our digital civic platform turns community issues into resolved actions.
            </p>

            <div className="eco-welcome-actions">
              <Link to="/authority" className="eco-pill-cta">
                <MapPin size={15} />
                <span>Council Board</span>
              </Link>
              <Link to="/track-complaint" className="eco-text-link">
                Track Status →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom 3 Focus Cards Section */}
      <section className="eco-cards-section">
        <div className="eco-section-center-header">
          <h2 className="eco-section-title">Key Municipal Focus Areas</h2>
        </div>

        <div className="eco-cards-grid">
          {/* Card 1 */}
          <div className="eco-feature-card">
            <div className="eco-card-img-wrap">
              <img 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80" 
                alt="Green Roadways" 
                className="eco-card-img"
              />
            </div>
            <div className="eco-card-body">
              <h3 className="eco-card-title">Well Eco-Friendly Roads</h3>
              <p className="eco-card-desc">
                Pothole resurfacing, culvert repairs, and pedestrian walkway safety audits across urban wards.
              </p>
              <Link to="/register-complaint" className="eco-card-pill-btn">
                <span>Report Road</span>
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="eco-feature-card">
            <div className="eco-card-img-wrap">
              <img 
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" 
                alt="Clean Water Systems" 
                className="eco-card-img"
              />
            </div>
            <div className="eco-card-body">
              <h3 className="eco-card-title">Sustainably Living Water</h3>
              <p className="eco-card-desc">
                Fast resolution for main water bursts, contaminated supplies, and storm drainage blockages.
              </p>
              <Link to="/register-complaint" className="eco-card-pill-btn">
                <span>Report Water</span>
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="eco-feature-card">
            <div className="eco-card-img-wrap">
              <img 
                src="https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=800&q=80" 
                alt="Public Power and Lighting" 
                className="eco-card-img"
              />
            </div>
            <div className="eco-card-body">
              <h3 className="eco-card-title">Community Power & Safety</h3>
              <p className="eco-card-desc">
                Immediate dispatch for broken streetlights, exposed live wires, and high-voltage hazards.
              </p>
              <Link to="/register-complaint" className="eco-card-pill-btn">
                <span>Report Power</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="eco-pagination-dots">
          <span className="eco-dot active" />
          <span className="eco-dot" />
          <span className="eco-dot" />
          <span className="eco-dot" />
        </div>
      </section>
    </div>
  );
}
