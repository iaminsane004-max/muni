import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowUpRight, 
  Cpu, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Building2, 
  Droplets, 
  Zap, 
  Truck, 
  CheckCircle2, 
  Search,
  Handshake
} from "lucide-react";
import { fetchAllComplaints } from "../services/supabase";

export default function Home() {
  const [stats, setStats] = useState({ total: 0, resolved: 0, inProgress: 0, critical: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const { complaints } = await fetchAllComplaints();
        const total = complaints.length;
        const resolved = complaints.filter(c => c.status === "Resolved").length;
        const inProgress = complaints.filter(c => c.status === "In Progress").length;
        const critical = complaints.filter(c => c.severity === "Critical" || c.priority === "Immediate").length;
        setStats({ total, resolved, inProgress, critical });
      } catch (err) {
        console.error("Stats error:", err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="minimal-page-wrapper">
      {/* 1. Hero Bento Island */}
      <section className="bento-island hero-island">
        {/* Avatar with Speech Bubble */}
        <div className="hero-avatar-row">
          <div className="hero-avatar-wrap">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80" 
              alt="Municipal Dispatch AI" 
              className="hero-avatar-img"
            />
          </div>
          <div className="hero-speech-bubble">
            <span className="live-ping-dot" />
            <span>CivicPulse AI • Live Triage v2.4 👋</span>
          </div>
        </div>

        {/* Big Bold Minimalist Headline */}
        <h1 className="hero-giant-headline">
          Building responsive <br />
          public services, safer roads, and <br />
          accountable cities.
        </h1>

        {/* Action Button Pills */}
        <div className="hero-pill-actions">
          <Link to="/register-complaint" className="btn-black-pill">
            <span>Report Defect</span>
            <ArrowUpRight size={15} />
          </Link>
          <Link to="/track-complaint" className="btn-white-pill">
            <span>Track by Reference ID</span>
          </Link>
        </div>

        {/* Monochrome Department Logos Strip */}
        <div className="department-strip-wrap">
          <div className="department-strip">
            <div className="dept-item">
              <Building2 size={16} />
              <span>PUBLIC WORKS DEPT</span>
            </div>
            <div className="dept-item">
              <Droplets size={16} />
              <span>WATER & SEWERAGE BOARD</span>
            </div>
            <div className="dept-item">
              <Zap size={16} />
              <span>STATE POWER CORP</span>
            </div>
            <div className="dept-item">
              <Truck size={16} />
              <span>CITY SANITATION WING</span>
            </div>
            <div className="dept-item">
              <ShieldCheck size={16} />
              <span>DISASTER SAFETY CELL</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Capabilities & Collaboration Island */}
      <section className="bento-island capabilities-island">
        <h2 className="section-centered-heading">
          Collaborating with citizens and municipal agencies <br />
          to create immediate civic impact.
        </h2>

        <div className="center-pill-tag">
          <span>Capabilities</span>
        </div>

        <div className="capabilities-grid-4">
          <div className="cap-col">
            <div className="cap-icon-wrap">
              <Cpu size={22} />
            </div>
            <h3>AI Defect Triage</h3>
            <p>
              Natural language processing automatically extracts category, severity, and urgency factors from citizen text.
            </p>
          </div>

          <div className="cap-col">
            <div className="cap-icon-wrap">
              <MapPin size={22} />
            </div>
            <h3>GIS Geolocation</h3>
            <p>
              Interactive Leaflet mapping pinpoints incidents with latitude, longitude, and reverse-geocoded street addresses.
            </p>
          </div>

          <div className="cap-col">
            <div className="cap-icon-wrap">
              <ShieldCheck size={22} />
            </div>
            <h3>Authority Dispatch</h3>
            <p>
              Municipal ward engineers receive structured queues with target SLAs, priority rankings, and photographic proof.
            </p>
          </div>

          <div className="cap-col">
            <div className="cap-icon-wrap">
              <Clock size={22} />
            </div>
            <h3>Lifecycle Tracking</h3>
            <p>
              Transparent milestones from submission through field inspection to verified closure and resolution remarks.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Real Municipal Infrastructure & Defect Showcase Island */}
      <section className="bento-island showcase-island">
        <div className="showcase-header">
          <div>
            <span className="small-section-label">CITY INFRASTRUCTURE</span>
            <h2>Active Civic Sectors Covered</h2>
          </div>
          <Link to="/authority" className="btn-white-pill">
            <span>View Authority Board</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="showcase-grid-2x2">
          {/* Item 1: Road & Pothole Repair */}
          <div className="showcase-card">
            <div className="showcase-img-wrap">
              <img 
                src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80" 
                alt="Road and Pothole Repair Work" 
                className="showcase-img"
              />
              <span className="showcase-badge">Roads & Infrastructure</span>
            </div>
            <div className="showcase-card-body">
              <h3>Asphalt Resurfacing & Pothole Repair</h3>
              <p>
                Prompt patching of dangerous craters, broken culverts, and eroded pedestrian pathways to keep urban transit smooth.
              </p>
              <Link to="/register-complaint" className="card-arrow-link">
                <span>File Road Report</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Item 2: Water Supply Pipelines */}
          <div className="showcase-card">
            <div className="showcase-img-wrap">
              <img 
                src="https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=900&q=80" 
                alt="Municipal Water Main Leak Repair" 
                className="showcase-img"
              />
              <span className="showcase-badge">Water & Sewage</span>
            </div>
            <div className="showcase-card-body">
              <h3>Drinking Water Mains & Sewerage Systems</h3>
              <p>
                Fast emergency isolation of burst mainlines, sewage overflow remediation, and drainage blockage clearing.
              </p>
              <Link to="/register-complaint" className="card-arrow-link">
                <span>File Water Report</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Item 3: Electrical Infrastructure */}
          <div className="showcase-card">
            <div className="showcase-img-wrap">
              <img 
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80" 
                alt="Electrical Power Line Inspection" 
                className="showcase-img"
              />
              <span className="showcase-badge">Electricity & Lighting</span>
            </div>
            <div className="showcase-card-body">
              <h3>Transformer Maintenance & Street Lighting</h3>
              <p>
                Priority safety dispatch for sparking live wires, fallen utility cables, and dark public corridors.
              </p>
              <Link to="/register-complaint" className="card-arrow-link">
                <span>File Power Report</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Item 4: Sanitation & Waste Management */}
          <div className="showcase-card">
            <div className="showcase-img-wrap">
              <img 
                src="https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=900&q=80" 
                alt="Clean City Sanitation Management" 
                className="showcase-img"
              />
              <span className="showcase-badge">Garbage & Hygiene</span>
            </div>
            <div className="showcase-card-body">
              <h3>Solid Waste Management & Sanitation</h3>
              <p>
                Deployment of heavy compactor vehicles for illegal dumpsites, biomedical waste removal, and public hygiene.
              </p>
              <Link to="/register-complaint" className="card-arrow-link">
                <span>File Sanitation Report</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA Island (Matching "Tell me about your next project") */}
      <section className="bento-island cta-island">
        <div className="cta-icon-circle">
          <Handshake size={24} className="text-zinc-800" />
        </div>

        <h2 className="cta-giant-heading">
          Tell us about your next <br />
          neighborhood issue
        </h2>

        <p className="cta-subtext">
          Submit defects directly with automatic AI categorization, evidence upload, 
          and live tracking backed by Supabase.
        </p>

        <div className="cta-buttons-row">
          <Link to="/register-complaint" className="btn-black-pill">
            <span>Report Defect</span>
            <ArrowUpRight size={15} />
          </Link>
          <Link to="/track-complaint" className="btn-white-pill">
            <span>Track Progress</span>
          </Link>
        </div>
      </section>

      {/* 5. Minimalist Clean Footer */}
      <footer className="minimal-footer">
        <div className="footer-left-copy">
          © 2026 CivicPulse AI. All municipal wards supported.
        </div>
        <div className="footer-right-links">
          <Link to="/authority">Council Portal</Link>
          <Link to="/track-complaint">Tracker</Link>
          <a href="https://supabase.com" target="_blank" rel="noreferrer">Supabase</a>
        </div>
      </footer>
    </div>
  );
}
