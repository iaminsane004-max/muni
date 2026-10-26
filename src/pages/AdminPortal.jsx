import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Lock, 
  User, 
  LogOut, 
  ShieldCheck, 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Edit3, 
  Trash2, 
  X, 
  Layers, 
  List, 
  Eye, 
  Sparkles,
  ArrowUpRight,
  KeyRound,
  Mail,
  Calendar,
  Phone
} from "lucide-react";
import InteractiveMap from "../components/InteractiveMap";
import { 
  fetchAllComplaints, 
  adminUpdateComplaint, 
  deleteComplaint, 
  signInAdmin, 
  signUpAdmin, 
  signOutAdmin, 
  getAdminSession,
  onAdminAuthStateChange,
  subscribeToComplaints 
} from "../services/supabase";

export default function AdminPortal() {
  // Auth State
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Complaints State
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Views
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("table"); // 'table' | 'map'

  // Selected complaint for editing/inspecting
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    department: "",
    severity: "",
    priority: "",
    official_notes: ""
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  // Check initial session & subscribe to auth changes
  useEffect(() => {
    async function checkAuth() {
      const currentSession = await getAdminSession();
      setSession(currentSession);
      setAuthLoading(false);
    }
    checkAuth();

    const unsubscribeAuth = onAdminAuthStateChange((event, newSession) => {
      setSession(newSession);
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch complaints once authenticated
  const loadComplaints = useCallback(async () => {
    if (!session) return;
    setRefreshing(true);
    try {
      const result = await fetchAllComplaints();
      setComplaints(result.complaints || []);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      setLoading(true);
      loadComplaints();

      const unsubscribeRealtime = subscribeToComplaints(() => {
        loadComplaints();
      });
      return () => unsubscribeRealtime();
    }
  }, [session, loadComplaints]);

  // Handle Supabase Auth (Sign In or Sign Up)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthError("");
    setAuthSuccessMsg("");

    try {
      if (isSignUpMode) {
        const { data, error } = await signUpAdmin(authEmail, authPassword);
        if (error) throw error;
        if (data?.session) {
          setSession(data.session);
        } else {
          setAuthSuccessMsg("Account created! Check your email for confirmation or sign in directly if email confirmations are disabled.");
        }
      } else {
        const { data, error } = await signInAdmin(authEmail, authPassword);
        if (error) throw error;
        if (data?.session) {
          setSession(data.session);
        }
      }
    } catch (err) {
      setAuthError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    setSession(null);
  };

  // Open Edit Modal with current complaint values
  const handleOpenEdit = (item) => {
    setSelectedComplaint(item);
    setEditForm({
      status: item.status || "Submitted",
      department: item.department || "Municipal Public Works",
      severity: item.severity || "Medium",
      priority: item.priority || "Normal",
      official_notes: item.official_notes || ""
    });
    setActionNotice("");
  };

  // Commit changes directly to Supabase
  const handleCommitEdit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSavingEdit(true);
    setActionNotice("");

    try {
      const result = await adminUpdateComplaint(selectedComplaint.id, editForm);
      if (result.success) {
        setActionNotice("Complaint specification and status updated successfully in Supabase!");
        setComplaints((prev) =>
          prev.map((c) => (c.id === selectedComplaint.id ? { ...c, ...editForm } : c))
        );
        setSelectedComplaint((prev) => ({ ...prev, ...editForm }));
      } else {
        alert(result.message || "Failed to update complaint.");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("An unexpected error occurred while updating.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete complaint
  const handleDeleteComplaint = async (id) => {
    if (!window.confirm(`Are you sure you want to permanently delete complaint ${id}?`)) {
      return;
    }

    try {
      const result = await deleteComplaint(id);
      if (result.success) {
        setComplaints((prev) => prev.filter((c) => c.id !== id));
        if (selectedComplaint?.id === id) {
          setSelectedComplaint(null);
        }
      } else {
        alert("Failed to delete record.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting complaint.");
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredComplaints.length) return;
    const headers = ["ID", "Title", "Category", "Severity", "Priority", "Status", "Department", "Location", "Latitude", "Longitude", "Citizen", "Contact", "Created_At", "Notes"];
    const rows = filteredComplaints.map(c => [
      c.id,
      `"${(c.title || c.description).replace(/"/g, '""')}"`,
      c.category,
      c.severity,
      c.priority,
      c.status,
      `"${(c.department || "").replace(/"/g, '""')}"`,
      `"${(c.location || "").replace(/"/g, '""')}"`,
      c.latitude || "",
      c.longitude || "",
      `"${(c.citizen_name || "").replace(/"/g, '""')}"`,
      `"${(c.citizen_contact || "").replace(/"/g, '""')}"`,
      c.created_at,
      `"${(c.official_notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_complaints_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    const q = search.trim().toLowerCase();
    return complaints.filter((item) => {
      const matchesSearch = !q || [item.id, item.title, item.description, item.location, item.citizen_name, item.citizen_contact, item.department]
        .some(val => String(val || "").toLowerCase().includes(q));

      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesSeverity = severityFilter === "All" || item.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesSeverity;
    });
  }, [complaints, search, statusFilter, categoryFilter, severityFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = complaints.length;
    const submitted = complaints.filter(c => c.status === "Submitted").length;
    const inProgress = complaints.filter(c => c.status === "In Progress").length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;
    const critical = complaints.filter(c => c.severity === "Critical" || c.priority === "Immediate").length;
    return { total, submitted, inProgress, resolved, critical };
  }, [complaints]);

  // Loading state
  if (authLoading) {
    return (
      <div className="admin-loading-screen">
        <div className="submit-spinner" style={{ width: "32px", height: "32px", borderColor: "rgba(0,0,0,0.1)", borderTopColor: "#111" }} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 1. SUPABASE AUTH LOGIN SCREEN (If not logged in)
  // ---------------------------------------------------------------------------
  if (!session) {
    return (
      <div className="admin-auth-wrapper">
        <div className="admin-auth-card">
          <div className="admin-lock-icon">
            <Lock size={26} className="text-zinc-800" />
          </div>

          <h2>Admin Control Center</h2>
          <p className="admin-auth-sub">
            Secure Supabase authentication required to inspect and modify civic records.
          </p>

          {authError && (
            <div className="auth-alert-box error">
              <AlertTriangle size={16} />
              <span>{authError}</span>
            </div>
          )}

          {authSuccessMsg && (
            <div className="auth-alert-box success">
              <CheckCircle2 size={16} />
              <span>{authSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="admin-auth-form">
            <div className="auth-input-group">
              <label>Administrator Email</label>
              <div className="auth-input-field">
                <Mail size={16} className="text-zinc-400" />
                <input 
                  type="email" 
                  placeholder="admin@city.gov" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <div className="auth-input-field">
                <KeyRound size={16} className="text-zinc-400" />
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="admin-auth-submit-btn" 
              disabled={authSubmitting}
            >
              {authSubmitting ? "Authenticating with Supabase..." : isSignUpMode ? "Create Admin Account" : "Sign In to Admin Portal"}
            </button>
          </form>

          <div className="admin-auth-footer-toggle">
            {isSignUpMode ? (
              <span>Already have an account? <button type="button" onClick={() => setIsSignUpMode(false)}>Sign In</button></span>
            ) : (
              <span>First time setting up? <button type="button" onClick={() => setIsSignUpMode(true)}>Create Admin Account</button></span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // ---------------------------------------------------------------------------
  return (
    <div className="admin-dashboard-wrapper">
      {/* Admin Top Header */}
      <div className="bento-island admin-header-island">
        <div className="admin-header-flex">
          <div className="admin-title-block">
            <div className="admin-shield-badge">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1>Municipal Admin Panel</h1>
              <p>Full complaint specification inspector & direct Supabase database controller</p>
            </div>
          </div>

          <div className="admin-user-block">
            <div className="admin-user-pill">
              <User size={14} />
              <span>{session.user.email}</span>
            </div>
            <button 
              onClick={handleSignOut} 
              className="admin-signout-btn" 
              title="Sign out of Supabase"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Admin KPI Row */}
        <div className="admin-kpi-row">
          <div className="kpi-box">
            <span className="kpi-num">{stats.total}</span>
            <span className="kpi-lbl">Total Logged</span>
          </div>
          <div className="kpi-box">
            <span className="kpi-num">{stats.submitted}</span>
            <span className="kpi-lbl">Pending Triage</span>
          </div>
          <div className="kpi-box">
            <span className="kpi-num">{stats.inProgress}</span>
            <span className="kpi-lbl">In Progress</span>
          </div>
          <div className="kpi-box">
            <span className="kpi-num">{stats.resolved}</span>
            <span className="kpi-lbl">Resolved</span>
          </div>
          <div className="kpi-box critical">
            <span className="kpi-num">{stats.critical}</span>
            <span className="kpi-lbl">Critical Priority</span>
          </div>
        </div>
      </div>

      {/* Filter and Action Toolbar */}
      <div className="bento-island admin-toolbar-island">
        <div className="admin-toolbar-flex">
          <div className="admin-search-wrap">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by ID, citizen, address, phone, or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-filters-group">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Electricity & Lighting">Electricity & Lighting</option>
              <option value="Water Supply & Sewage">Water Supply & Sewage</option>
              <option value="Roads & Infrastructure">Roads & Infrastructure</option>
              <option value="Garbage & Sanitation">Garbage & Sanitation</option>
              <option value="Public Safety & Hazards">Public Safety & Hazards</option>
            </select>

            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button 
              className="action-btn-outline" 
              onClick={handleExportCSV}
              title="Export all rows to CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button 
              className="action-btn-outline" 
              onClick={loadComplaints}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Specifications Data Table */}
      <div className="bento-island admin-table-island">
        <div className="table-responsive">
          <table className="admin-full-specs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category & Confidence</th>
                <th>Incident Title & Description</th>
                <th>Location & GPS</th>
                <th>Severity</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Dept</th>
                <th>Citizen Contact</th>
                <th>Photo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-zinc-400">
                    No complaints matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-xs font-bold text-zinc-900 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td>
                      <div className="font-semibold text-xs text-zinc-800">{item.category}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {Math.round((item.ai_confidence || 0.85) * 100)}% match
                      </div>
                    </td>
                    <td className="max-w-[260px]">
                      <div className="font-bold text-xs text-zinc-900 truncate" title={item.title}>
                        {item.title || item.description.slice(0, 40)}
                      </div>
                      <div className="text-xs text-zinc-500 line-clamp-2" title={item.description}>
                        {item.description}
                      </div>
                    </td>
                    <td className="text-xs text-zinc-600 max-w-[180px]">
                      <div className="truncate" title={item.location}>{item.location}</div>
                      {item.latitude && item.longitude && (
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {Number(item.latitude).toFixed(3)}, {Number(item.longitude).toFixed(3)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`severity-tag severity-${(item.severity || "medium").toLowerCase()}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-xs text-zinc-700">
                        {item.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill status-${(item.status || "submitted").toLowerCase().replace(/\s+/g, "-")}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-xs font-medium text-zinc-700 max-w-[150px] truncate" title={item.department}>
                      {item.department || "Municipal Works"}
                    </td>
                    <td className="text-xs text-zinc-600 whitespace-nowrap">
                      <div>{item.citizen_name || "Anonymous"}</div>
                      <div className="text-[11px] text-zinc-400">{item.citizen_contact || "No contact"}</div>
                    </td>
                    <td>
                      {item.image_url ? (
                        <a href={item.image_url} target="_blank" rel="noreferrer" title="Click to view full evidence">
                          <img 
                            src={item.image_url} 
                            alt="Evidence" 
                            className="w-10 h-10 object-cover rounded-lg border border-zinc-200" 
                          />
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-400">None</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button 
                          className="table-btn edit" 
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Specification & Status"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button 
                          className="table-btn delete" 
                          onClick={() => handleDeleteComplaint(item.id)}
                          title="Delete Complaint"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Specification & Status Modal */}
      {selectedComplaint && (
        <div className="modal-backdrop">
          <div className="manage-modal-card admin-modal">
            <div className="manage-modal-header">
              <div>
                <span className="reference-pill">{selectedComplaint.id}</span>
                <h2>Admin Specification & Status Editor</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedComplaint(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="manage-modal-body">
              {actionNotice && (
                <div className="auth-alert-box success">
                  <CheckCircle2 size={16} />
                  <span>{actionNotice}</span>
                </div>
              )}

              <form onSubmit={handleCommitEdit}>
                <div className="modal-two-col">
                  {/* Left Column: Complaint Specifications (Read-Only Preview) */}
                  <div className="admin-spec-preview-col">
                    <h4>Incident Specifications</h4>
                    <p className="spec-desc">{selectedComplaint.description}</p>

                    <div className="spec-details-list">
                      <div className="spec-row">
                        <span className="k">Location:</span>
                        <span className="v">{selectedComplaint.location}</span>
                      </div>
                      <div className="spec-row">
                        <span className="k">GPS Coordinates:</span>
                        <span className="v font-mono">{selectedComplaint.latitude || "N/A"}, {selectedComplaint.longitude || "N/A"}</span>
                      </div>
                      <div className="spec-row">
                        <span className="k">AI Category:</span>
                        <span className="v">{selectedComplaint.category} ({Math.round((selectedComplaint.ai_confidence || 0.85) * 100)}% match)</span>
                      </div>
                      <div className="spec-row">
                        <span className="k">Citizen:</span>
                        <span className="v">{selectedComplaint.citizen_name || "Anonymous"} ({selectedComplaint.citizen_contact || "No Contact"})</span>
                      </div>
                      <div className="spec-row">
                        <span className="k">Logged At:</span>
                        <span className="v">{new Date(selectedComplaint.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    {selectedComplaint.image_url && (
                      <div className="spec-photo-wrap">
                        <span className="text-xs font-bold text-zinc-500 uppercase block mb-1">Attached Evidence Photo:</span>
                        <img 
                          src={selectedComplaint.image_url} 
                          alt="Citizen Evidence" 
                          className="w-full max-h-44 object-cover rounded-xl border border-zinc-200" 
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Column: Direct Editable Fields */}
                  <div className="admin-spec-edit-col">
                    <h4>Make Changes (Direct Supabase Sync)</h4>

                    <div className="auth-input-group mb-3">
                      <label>Update Status:</label>
                      <select 
                        value={editForm.status} 
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="admin-edit-input"
                      >
                        <option value="Submitted">Submitted (Pending Review)</option>
                        <option value="In Progress">In Progress (Field Crews Dispatched)</option>
                        <option value="Resolved">Resolved (Work Completed)</option>
                        <option value="Rejected">Rejected (Out of Scope / Duplicate)</option>
                      </select>
                    </div>

                    <div className="auth-input-group mb-3">
                      <label>Reassign Municipal Department:</label>
                      <input 
                        type="text" 
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="admin-edit-input"
                        placeholder="E.g. Public Works Dept (PWD)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="auth-input-group">
                        <label>Severity:</label>
                        <select 
                          value={editForm.severity} 
                          onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                          className="admin-edit-input"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>

                      <div className="auth-input-group">
                        <label>Priority Queue:</label>
                        <select 
                          value={editForm.priority} 
                          onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                          className="admin-edit-input"
                        >
                          <option value="Low">Low</option>
                          <option value="Normal">Normal</option>
                          <option value="Elevated">Elevated</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Immediate">Immediate</option>
                        </select>
                      </div>
                    </div>

                    <div className="auth-input-group mb-4">
                      <label>Official Resolution Notes & Citizen Remarks:</label>
                      <textarea 
                        rows={4}
                        value={editForm.official_notes}
                        onChange={(e) => setEditForm({ ...editForm, official_notes: e.target.value })}
                        className="admin-edit-textarea"
                        placeholder="Add official dispatch logs, crew work reference, or completion comments..."
                      />
                    </div>

                    <div className="admin-modal-actions">
                      <button 
                        type="button" 
                        className="secondary-btn" 
                        onClick={() => setSelectedComplaint(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="primary-btn" 
                        disabled={savingEdit}
                      >
                        {savingEdit ? "Committing to Supabase..." : "Save Changes to Database"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
