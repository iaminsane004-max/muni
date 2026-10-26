import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AdminPortal from "./pages/AdminPortal";
import Demo from "./components/ui/demo";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />

        <main className="main-content-viewport">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/header-demo" element={<Demo />} />
            <Route path="/register-complaint" element={<RegisterComplaint />} />
            <Route path="/track-complaint" element={<TrackComplaint />} />
            <Route path="/authority" element={<AuthorityDashboard />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/citizen" element={<Navigate to="/register-complaint" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="global-site-footer">
          <div className="footer-inner-content">
            <div className="footer-brand-wrap">
              <Link to="/" className="footer-brand-logo">
                <span className="footer-brand-dot" />
                <span className="footer-brand-title">CivicPulse</span>
              </Link>
              <span className="footer-brand-copy">© 2026 CivicPulse</span>
            </div>

            <nav className="footer-nav-menu">
              <Link to="/" className="footer-link-item">Overview</Link>
              <Link to="/register-complaint" className="footer-link-item">Report Defect</Link>
              <Link to="/track-complaint" className="footer-link-item">Track Status</Link>
              <Link to="/authority" className="footer-link-item">Authority Board</Link>
              <Link to="/admin" className="footer-link-item footer-admin-link">Admin Portal</Link>
            </nav>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
