
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import AuthorityDashboard from "./AuthorityDashboard";
import CitizenPortal from "./pages/CitizenPortal";

import "./App.css";

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        AI Municipal Complaint Analyzer
      </Link>

      <div className="navbar-links">
        <Link
          to="/"
          className={location.pathname === "/" ? "active" : ""}
        >
          Home
        </Link>

        <Link
          to="/register-complaint"
          className={
            location.pathname === "/register-complaint"
              ? "active"
              : ""
          }
        >
          Register Complaint
        </Link>

        <Link
          to="/track-complaint"
          className={
            location.pathname === "/track-complaint"
              ? "active"
              : ""
          }
        >
          Track Complaint
        </Link>

        <Link
          to="/authority"
          className={
            location.pathname === "/authority"
              ? "active"
              : ""
          }
        >
          Authority
        </Link>
      </div>
    </nav>
  );
}

function AppLayout() {
  return (
    <div className="app">

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/register-complaint"
          element={<RegisterComplaint />}
        />

        <Route
          path="/track-complaint"
          element={<TrackComplaint />}
        />

        <Route
          path="/authority"
          element={<AuthorityDashboard />}
        />

        <Route 
          path="/citizen" 
          element={<CitizenPortal />} 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
