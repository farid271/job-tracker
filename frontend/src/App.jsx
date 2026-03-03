import { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

const API = "https://job-tracker-backend-702k.onrender.com/api/applications";
const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

function App() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");
  const [form, setForm] = useState({
    company: "", role: "", status: "Applied", date_applied: "", notes: ""
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(API);
      setApplications(res.data);
    } catch {
      setError("Failed to connect to backend.");
    }
  };

  const handleAdd = async () => {
    if (!form.company.trim() || !form.role.trim()) {
      setError("Company and role are required.");
      return;
    }
    try {
      const res = await axios.post(API, form);
      setApplications([res.data, ...applications]);
      setForm({ company: "", role: "", status: "Applied", date_applied: "", notes: "" });
      setError("");
    } catch (err) {
      console.error("ADD ERROR:", err.message, err.response?.status, err.response?.data);
      setError("Failed to add application: " + err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await axios.patch(`${API}/${id}`, { status });
      setApplications(applications.map(a => a.id === id ? res.data : a));
    } catch {
      setError("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      setApplications(applications.filter(a => a.id !== id));
    } catch {
      setError("Failed to delete application.");
    }
  };

  const filtered = filter === "All"
    ? applications
    : applications.filter(a => a.status === filter);

  const countBy = (status) => applications.filter(a => a.status === status).length;

  return (
    <div className="app">
      <div className="header">
        <div className="header-top">
          <h1>Job Tracker</h1>
          <span className="header-tag">Ottawa 2026</span>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            data-testid="theme-toggle"
          >
            {theme === "light" ? "dark mode" : "light mode"}
          </button>
        </div>
        <p className="subtitle">tracking your path to an internship</p>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-number" data-testid="stat-total">{applications.length}</div>
          <div className="stat-label">Total</div>
        </div>
        {STATUSES.map(s => (
          <div className="stat-card" key={s}>
            <div className={`stat-number ${s.toLowerCase()}`} data-testid={`stat-${s.toLowerCase()}`}>
              {countBy(s)}
            </div>
            <div className="stat-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="form-card">
        <h2>New Application</h2>
        {error && <div className="error-msg" data-testid="error-msg">{error}</div>}
        <div className="form-grid">
          <input
            data-testid="company-input"
            placeholder="Company"
            value={form.company}
            onChange={e => setForm({ ...form, company: e.target.value })}
          />
          <input
            data-testid="role-input"
            placeholder="Role"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
          />
          <select
            data-testid="status-select"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <input
            data-testid="date-input"
            type="date"
            value={form.date_applied}
            onChange={e => setForm({ ...form, date_applied: e.target.value })}
          />
        </div>
        <textarea
          data-testid="notes-input"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
        />
        <button data-testid="add-btn" onClick={handleAdd}>Add Application</button>
      </div>

      <div className="filters">
        {["All", ...STATUSES].map(s => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
            data-testid={`filter-${s.toLowerCase()}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="applications-list">
        {filtered.length === 0 ? (
          <div className="empty-state" data-testid="empty-state">
            no applications yet — add one above
          </div>
        ) : (
          filtered.map(app => (
            <div className="application-card" key={app.id} data-testid="application-card">
              <div className="app-info">
                <div className="app-company">{app.company}</div>
                <div className="app-role">{app.role}</div>
                <div className="app-meta">
                  {app.date_applied && (
                    <span className="app-date">
                      {new Date(app.date_applied).toLocaleDateString()}
                    </span>
                  )}
                  {app.notes && <span className="app-notes">{app.notes}</span>}
                </div>
              </div>
              <div className="app-actions">
                <select
                  className={`status-select ${app.status}`}
                  value={app.status}
                  onChange={e => handleStatusChange(app.id, e.target.value)}
                  data-testid="status-update"
                >
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(app.id)}
                  data-testid="delete-btn"
                >✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;