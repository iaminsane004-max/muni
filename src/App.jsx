import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import GlowHorizonDemo from "./components/ui/demo";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />

        <main className="main-content-viewport">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/demo" element={<GlowHorizonDemo />} />
            <Route path="/register-complaint" element={<RegisterComplaint />} />
            <Route path="/track-complaint" element={<TrackComplaint />} />
            <Route path="/authority" element={<AuthorityDashboard />} />
            <Route path="/citizen" element={<Navigate to="/register-complaint" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-left">
              <strong>CivicPulse AI</strong> — Municipal Complaint & Public Infrastructure Triage
            </div>
            <div className="footer-right">
              <span>Backed by Supabase PostgreSQL</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
