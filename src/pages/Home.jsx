import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  Activity, 
  MapPin, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Database
} from "lucide-react";
import { fetchAllComplaints } from "../services/supabase";
import GlowHorizonFM from "@/components/ui/glow-horizon";

export default function Home() {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    critical: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { complaints } = await fetchAllComplaints();
        const total = complaints.length;
        const resolved = complaints.filter(c => c.status === "Resolved").length;
        const inProgress = complaints.filter(c => c.status === "In Progress").length;
        const critical = complaints.filter(c => c.severity === "Critical" || c.priority === "Immediate").length;

        setStats({ total, resolved, inProgress, critical });
        setRecentComplaints(complaints.slice(0, 4));
      } catch (err) {
        console.error("Failed to load home stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section with Cosmic Glow Horizon */}
      <section className="hero-section">
        <div className="hero-horizon-backdrop">
          <GlowHorizonFM variant="top" />
        </div>

        <div className="hero-badge">
          <Sparkles size={14} className="text-blue-400" />
          <span>Next-Gen Civic Governance • Powered by AI & Supabase</span>
        </div>

        <h1 className="hero-headline">
          Intelligent Municipal <br />
          <span className="gradient-text">Complaint & Resolution System</span>
        </h1>

        <p className="hero-subtext">
          Report municipal issues with instant AI triage, automatic severity detection, 
          real-time geolocation mapping, and complete status transparency backed by Supabase.
        </p>

        <div className="hero-cta-group">
          <Link to="/register-complaint" className="btn-primary-glow">
            <PlusCircle size={18} />
            <span>Report Civic Issue</span>
          </Link>

          <Link to="/track-complaint" className="btn-secondary-glass">
            <Search size={18} />
            <span>Track by ID</span>
          </Link>

          <Link to="/authority" className="btn-tertiary-link">
            <ShieldCheck size={18} />
            <span>Authority Portal →</span>
          </Link>
        </div>

        {/* Live Metrics Row */}
        <div className="metrics-ribbon">
          <div className="metric-box">
            <div className="metric-icon-wrap bg-blue-500-10">
              <Activity className="text-blue-400" size={20} />
            </div>
            <div className="metric-data">
              <div className="metric-value">{stats.total || "—"}</div>
              <div className="metric-label">Total Complaints Logged</div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-wrap bg-emerald-500-10">
              <CheckCircle2 className="text-emerald-400" size={20} />
            </div>
            <div className="metric-data">
              <div className="metric-value">{stats.resolved || "—"}</div>
              <div className="metric-label">Resolved & Closed</div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-wrap bg-amber-500-10">
              <Clock className="text-amber-400" size={20} />
            </div>
            <div className="metric-data">
              <div className="metric-value">{stats.inProgress || "—"}</div>
              <div className="metric-label">In Active Resolution</div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-wrap bg-rose-500-10">
              <AlertCircle className="text-rose-400" size={20} />
            </div>
            <div className="metric-data">
              <div className="metric-value">{stats.critical || "—"}</div>
              <div className="metric-label">Critical / Urgent Triage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section className="portal-modules-section">
        <div className="section-header">
          <span className="section-tag">CIVIC ECOSYSTEM</span>
          <h2>Designed for Citizens and Municipal Authorities</h2>
          <p>Choose an operational module to interact with your city's public works network</p>
        </div>

        <div className="portal-cards-grid">
          <Link to="/register-complaint" className="module-card">
            <div className="module-card-icon citizen-theme">
              <PlusCircle size={28} />
            </div>
            <div className="module-tag">PUBLIC PORTAL</div>
            <h3>File a Complaint</h3>
            <p>
              Submit issues like broken roads, water leaks, or sparking transformers. 
              Our real-time NLP instantly detects hazard severity without manual bureaucracy.
            </p>
            <div className="module-footer">
              <span>Start Submission</span>
              <ArrowRight size={16} />
            </div>
          </Link>

          <Link to="/track-complaint" className="module-card">
            <div className="module-card-icon tracking-theme">
              <Search size={28} />
            </div>
            <div className="module-tag">TRANSPARENCY</div>
            <h3>Live Progress Tracker</h3>
            <p>
              Check the exact workflow milestone of any complaint with your reference ID. 
              View inspection notes, assigned department, and resolution timeline.
            </p>
            <div className="module-footer">
              <span>Lookup Status</span>
              <ArrowRight size={16} />
            </div>
          </Link>

          <Link to="/authority" className="module-card">
            <div className="module-card-icon authority-theme">
              <ShieldCheck size={28} />
            </div>
            <div className="module-tag">OFFICIAL DISPATCH</div>
            <h3>Authority Command Center</h3>
            <p>
              Geospatial heatmaps, automated priority queues, status updating, 
              and department dispatching built for municipal ward officers and engineers.
            </p>
            <div className="module-footer">
              <span>Launch Terminal</span>
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      </section>

      {/* Live Public Issues Feed */}
      <section className="recent-feed-section">
        <div className="section-header">
          <span className="section-tag">PUBLIC TRANSPARENCY</span>
          <h2>Recent City Reports</h2>
          <p>Real-time civic issues submitted across municipal wards</p>
        </div>

        <div className="recent-complaints-grid">
          {recentComplaints.map((item) => (
            <div key={item.id} className="feed-card">
              <div className="feed-card-header">
                <span className="feed-category">{item.category}</span>
                <span className={`status-pill status-${(item.status || "submitted").toLowerCase().replace(/\s+/g, "-")}`}>
                  {item.status}
                </span>
              </div>
              <h4 className="feed-title">{item.title || item.description.slice(0, 50)}</h4>
              <p className="feed-desc">{item.description.slice(0, 110)}...</p>
              <div className="feed-meta">
                <div className="feed-location">
                  <MapPin size={13} />
                  <span>{item.location}</span>
                </div>
                <div className="feed-severity">
                  <span className={`priority-dot priority-${(item.severity || "medium").toLowerCase()}`} />
                  <span>{item.severity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Highlights */}
      <section className="tech-banner">
        <div className="tech-banner-inner">
          <div className="tech-badge">
            <Cpu size={16} />
            <span>Modern Architecture</span>
          </div>
          <h3>Built on Supabase PostgreSQL & Serverless Edge</h3>
          <p>
            Eliminates brittle local file servers. Supports cloud database storage, 
            instant image upload to Supabase Storage, and zero-config deployment to Vercel.
          </p>
          <div className="tech-chips">
            <span className="tech-chip"><Database size={13} /> Supabase PostgreSQL</span>
            <span className="tech-chip"><Sparkles size={13} /> Real-Time NLP Urgency Engine</span>
            <span className="tech-chip"><Layers size={13} /> Leaflet Geospatial GIS</span>
            <span className="tech-chip"><TrendingUp size={13} /> Vercel Serverless Ready</span>
          </div>
        </div>
      </section>
    </div>
  );
}
