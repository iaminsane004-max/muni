import { useState, useEffect, useMemo, useCallback } from "react";
import { 
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
  ExternalLink, 
  Layers, 
  List, 
  Eye, 
  X,
  Building2,
  FileText,
  User,
  Sparkles,
  Database
} from "lucide-react";
import InteractiveMap from "../components/InteractiveMap";
import { 
  fetchAllComplaints, 
  updateComplaintStatus, 
  subscribeToComplaints 
} from "../services/supabase";

export default function AuthorityDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState("supabase");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [activeView, setActiveView] = useState("split"); // 'split' | 'table'

  // Selected complaint for modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editingStatus, setEditingStatus] = useState("");
  const [editingNotes, setEditingNotes] = useState("");
  const [editingDept, setEditingDept] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await fetchAllComplaints();
      setComplaints(result.complaints || []);
      setDataSource(result.source || "demo");
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Setup Supabase realtime listener
    const unsubscribe = subscribeToComplaints((payload) => {
      console.log("Realtime event received:", payload);
      loadData();
    });

    return () => unsubscribe();
  }, [loadData]);

  // Open manage modal
  const handleOpenManage = (item) => {
    setSelectedComplaint(item);
    setEditingStatus(item.status || "Submitted");
    setEditingNotes(item.official_notes || "");
    setEditingDept(item.department || "Municipal Public Works");
    setActionNotice("");
  };

  // Save status & notes
  const handleSaveStatus = async () => {
    if (!selectedComplaint) return;
    setSavingStatus(true);
    setActionNotice("");

    try {
      const result = await updateComplaintStatus(
        selectedComplaint.id,
        editingStatus,
        editingNotes,
        editingDept
      );

      if (result.success) {
        setActionNotice("Status and dispatch notes updated successfully!");
        // Update local state
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id
              ? { ...c, status: editingStatus, official_notes: editingNotes, department: editingDept, updated_at: new Date().toISOString() }
              : c
          )
        );
        setSelectedComplaint((prev) => ({
          ...prev,
          status: editingStatus,
          official_notes: editingNotes,
          department: editingDept,
          updated_at: new Date().toISOString()
        }));
      } else {
        alert("Failed to update status. Please try again.");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Error updating complaint status.");
    } finally {
      setSavingStatus(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredComplaints.length) return;
    const headers = ["ID", "Title", "Category", "Severity", "Priority", "Status", "Department", "Location", "Created At"];
    const rows = filteredComplaints.map(c => [
      c.id,
      `"${(c.title || c.description).replace(/"/g, '""')}"`,
      c.category,
      c.severity,
      c.priority,
      c.status,
      `"${(c.department || "").replace(/"/g, '""')}"`,
      `"${(c.location || "").replace(/"/g, '""')}"`,
      c.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `civicpulse_complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = complaints.length;
    const submitted = complaints.filter(c => c.status === "Submitted").length;
    const inProgress = complaints.filter(c => c.status === "In Progress").length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;
    const critical = complaints.filter(c => c.severity === "Critical" || c.priority === "Immediate").length;
    return { total, submitted, inProgress, resolved, critical };
  }, [complaints]);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    const q = search.trim().toLowerCase();
    return complaints.filter((item) => {
      const matchesSearch = !q || [item.id, item.title, item.description, item.location, item.citizen_name]
        .some(val => String(val || "").toLowerCase().includes(q));

      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesSeverity = severityFilter === "All" || item.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesSeverity;
    });
  }, [complaints, search, statusFilter, categoryFilter, severityFilter]);

  return (
    <div className="authority-container">
      {/* Top Header */}
      <div className="authority-header">
        <div className="header-branding">
          <div className="auth-shield-wrap">
            <ShieldCheck size={24} className="text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1>Municipal Authority Command Center</h1>
              <span className={`db-mode-indicator ${dataSource === "supabase" ? "live" : "demo"}`}>
                <Database size={11} />
                <span>{dataSource === "supabase" ? "Supabase Live Sync" : "Demo Data Active"}</span>
              </span>
            </div>
            <p>Real-time civic defect dispatch, automated priority queues & GIS mapping</p>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="action-btn-outline" 
            onClick={loadData}
            disabled={refreshing}
            title="Refresh Complaints"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Syncing..." : "Sync"}</span>
          </button>

          <button 
            className="action-btn-outline" 
            onClick={handleExportCSV}
            title="Export filtered records to CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Counters Ribbon */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-num">{stats.total}</div>
          <div className="kpi-label">Total Logged</div>
        </div>
        <div className="kpi-card submitted">
          <div className="kpi-num">{stats.submitted}</div>
          <div className="kpi-label">Pending Triage</div>
        </div>
        <div className="kpi-card progress">
          <div className="kpi-num">{stats.inProgress}</div>
          <div className="kpi-label">In Field Progress</div>
        </div>
        <div className="kpi-card resolved">
          <div className="kpi-num">{stats.resolved}</div>
          <div className="kpi-label">Resolved & Closed</div>
        </div>
        <div className="kpi-card critical">
          <div className="kpi-num">{stats.critical}</div>
          <div className="kpi-label">Immediate / Critical</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-bar-wrap">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by ID, keyword, address, or citizen..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-selects-row">
          <div className="filter-select-item">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-select-item">
            <label>Category:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Electricity & Lighting">Electricity & Lighting</option>
              <option value="Water Supply & Sewage">Water Supply & Sewage</option>
              <option value="Roads & Infrastructure">Roads & Infrastructure</option>
              <option value="Garbage & Sanitation">Garbage & Sanitation</option>
              <option value="Public Safety & Hazards">Public Safety & Hazards</option>
              <option value="Parks & Public Amenities">Parks & Amenities</option>
            </select>
          </div>

          <div className="filter-select-item">
            <label>Severity:</label>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="view-toggle-btns">
            <button 
              className={`toggle-btn ${activeView === "split" ? "active" : ""}`}
              onClick={() => setActiveView("split")}
              title="Split Map & List View"
            >
              <Layers size={16} />
              <span>Map & List</span>
            </button>
            <button 
              className={`toggle-btn ${activeView === "table" ? "active" : ""}`}
              onClick={() => setActiveView("table")}
              title="Full Data Table View"
            >
              <List size={16} />
              <span>Data Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeView === "split" ? (
        <div className="split-view-grid">
          {/* Left: GIS Map */}
          <div className="map-view-column">
            <div className="section-card-header">
              <h3>City Incident GIS Heatmap</h3>
              <span className="count-pill">{filteredComplaints.length} markers</span>
            </div>
            <InteractiveMap 
              markers={filteredComplaints}
              center={[12.9716, 77.5946]}
              zoom={12}
              height="580px"
            />
          </div>

          {/* Right: Complaints Card List */}
          <div className="list-view-column">
            <div className="section-card-header">
              <h3>Active Dispatch Queue</h3>
              <span className="count-pill">{filteredComplaints.length} records</span>
            </div>

            <div className="queue-cards-list">
              {filteredComplaints.length === 0 ? (
                <div className="empty-notice">No complaints matching current filters.</div>
              ) : (
                filteredComplaints.map((item) => (
                  <div key={item.id} className="queue-card">
                    <div className="queue-card-top">
                      <span className="queue-id">{item.id}</span>
                      <span className={`status-pill status-${(item.status || "submitted").toLowerCase().replace(/\s+/g, "-")}`}>
                        {item.status}
                      </span>
                    </div>

                    <h4 className="queue-title">{item.title || item.description.slice(0, 50)}</h4>
                    <p className="queue-desc">{item.description.slice(0, 95)}...</p>

                    <div className="queue-meta-row">
                      <span className={`severity-tag severity-${(item.severity || "medium").toLowerCase()}`}>
                        {item.severity}
                      </span>
                      <span className="category-tag-sm">{item.category}</span>
                      <span className="location-tag-sm">
                        <MapPin size={11} className="inline mr-1" />
                        {item.location.split(",")[0]}
                      </span>
                    </div>

                    <div className="queue-card-footer">
                      <span className="time-ago">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <button 
                        className="manage-btn"
                        onClick={() => handleOpenManage(item)}
                      >
                        <Edit3 size={14} />
                        <span>Inspect & Update</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full Data Table View */
        <div className="full-table-card">
          <div className="table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Incident Description</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      No complaints found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono text-xs font-semibold text-blue-400">{item.id}</td>
                      <td>
                        <span className="category-pill-table">{item.category}</span>
                      </td>
                      <td className="table-desc-cell" title={item.description}>
                        {item.description.slice(0, 60)}...
                      </td>
                      <td>
                        <span className={`severity-tag severity-${(item.severity || "medium").toLowerCase()}`}>
                          {item.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill status-${(item.status || "submitted").toLowerCase().replace(/\s+/g, "-")}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="text-xs text-slate-300">{item.department || "Municipal Works"}</td>
                      <td className="text-xs text-slate-400">{item.location.slice(0, 25)}...</td>
                      <td className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="table-action-btn"
                          onClick={() => handleOpenManage(item)}
                        >
                          <Eye size={14} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complaint Inspection & Status Update Modal */}
      {selectedComplaint && (
        <div className="modal-backdrop">
          <div className="manage-modal-card">
            <div className="manage-modal-header">
              <div>
                <span className="reference-pill">{selectedComplaint.id}</span>
                <h2>{selectedComplaint.title || selectedComplaint.description.slice(0, 45)}</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedComplaint(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="manage-modal-body">
              {actionNotice && (
                <div className="success-banner-sm">
                  <CheckCircle2 size={16} />
                  <span>{actionNotice}</span>
                </div>
              )}

              <div className="modal-two-col">
                {/* Left Side: Citizen Details */}
                <div className="modal-info-panel">
                  <h4>Incident Details</h4>
                  <p className="full-description">{selectedComplaint.description}</p>

                  <div className="meta-list">
                    <div className="meta-list-item">
                      <span className="lbl">Category:</span>
                      <span className="val font-medium">{selectedComplaint.category}</span>
                    </div>
                    <div className="meta-list-item">
                      <span className="lbl">AI Severity & Priority:</span>
                      <span className="val">{selectedComplaint.severity} / {selectedComplaint.priority}</span>
                    </div>
                    <div className="meta-list-item">
                      <span className="lbl">Location:</span>
                      <span className="val">{selectedComplaint.location}</span>
                    </div>
                    <div className="meta-list-item">
                      <span className="lbl">Reported By:</span>
                      <span className="val">{selectedComplaint.citizen_name || "Anonymous"} ({selectedComplaint.citizen_contact || "No Contact"})</span>
                    </div>
                    <div className="meta-list-item">
                      <span className="lbl">Submission Time:</span>
                      <span className="val">{new Date(selectedComplaint.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {selectedComplaint.image_url && (
                    <div className="modal-evidence-box">
                      <h5>Citizen Evidence Photograph:</h5>
                      <a href={selectedComplaint.image_url} target="_blank" rel="noreferrer" title="Click to view full image">
                        <img 
                          src={selectedComplaint.image_url} 
                          alt="Citizen Evidence" 
                          className="modal-evidence-thumb" 
                        />
                      </a>
                    </div>
                  )}
                </div>

                {/* Right Side: Authority Action Panel */}
                <div className="modal-action-panel">
                  <h4>Authority Workflow Dispatch</h4>

                  <div className="form-field-group">
                    <label>Update Status:</label>
                    <select 
                      className="auth-select-input"
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value)}
                    >
                      <option value="Submitted">Submitted (Under Review)</option>
                      <option value="In Progress">In Progress (Crews Dispatched)</option>
                      <option value="Resolved">Resolved (Work Complete)</option>
                      <option value="Rejected">Rejected (Out of Scope / Duplicate)</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label>Assigned Department:</label>
                    <input 
                      type="text" 
                      className="auth-text-input"
                      value={editingDept}
                      onChange={(e) => setEditingDept(e.target.value)}
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Official Resolution Notes / Remarks for Citizen:</label>
                    <textarea 
                      rows={4}
                      className="auth-textarea-input"
                      placeholder="Enter official action taken, crew dispatch reference, or completion report..."
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                    />
                  </div>

                  <div className="modal-action-footer">
                    <button 
                      type="button" 
                      className="secondary-btn" 
                      onClick={() => setSelectedComplaint(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="primary-btn" 
                      onClick={handleSaveStatus}
                      disabled={savingStatus}
                    >
                      {savingStatus ? "Saving to Supabase..." : "Commit Update"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
