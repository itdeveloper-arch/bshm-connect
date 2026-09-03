import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ConcernModal from "../components/ConcernModal";
import OfficerModal from "../components/OfficerModal";
import MilestoneModal from "../components/MilestoneModal";
import EventModal from "../components/EventModal";

const ROLE_INFO = {
  Operator: {
    title: "Operator / Site Administrator",
    items: [
      "Manage all organization announcements.",
      "Add, update, and manage department Milestones & Achievements.",
      "Manage and customize student officers and organizational chart.",
      "Upload and manage officer profile pictures.",
      "Review student concerns and update resolution status.",
      "Monitor all website activities.",
    ],
  },
  "BSHM Officer": {
    title: "BSHM Officer",
    items: [
      "Add, edit, and feature department Milestones & competition achievements.",
      "Add, edit, or remove officers in the organizational chart.",
      "Upload and update officer photos in real time.",
      "Publish announcements for students.",
      "Review and respond to student concerns.",
    ],
  },
  "Department Adviser": {
    title: "Department Adviser",
    items: [
      "Add, edit, and feature department Milestones, accreditations, and recognitions.",
      "Review student concerns and monitor resolution steps.",
      "Monitor officer actions, updates, and announcements.",
      "Publish and manage department announcements.",
      "Review organization organizational chart.",
      "Provide guidance to the officer council.",
    ],
  },
};

function getInitials(name) {
  return name
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function StatusBadge({ status }) {
  const cls = status === "Resolved" ? "resolved" : status === "Under Review" ? "review" : "received";
  return <span className={`status ${cls}`}>{status}</span>;
}

export default function Dashboard() {
  const {
    currentRole,
    logout,
    concerns,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    officers,
    addOfficer,
    updateOfficer,
    deleteOfficer,
    resetOfficers,
    officerPhotos,
    milestones,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    showToast,
  } = useApp();

  const navigate = useNavigate();
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [officerModalData, setOfficerModalData] = useState(null); // null, 'new', or officer object
  const [milestoneModalData, setMilestoneModalData] = useState(null); // null, 'new', or milestone object
  const [annTitle, setAnnTitle] = useState("");
  const [annText, setAnnText] = useState("");
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [eventModalData, setEventModalData] = useState(null);
  const [officerFilter, setOfficerFilter] = useState("");
  const [milestoneFilter, setMilestoneFilter] = useState("");
  const [dashboardSection, setDashboardSection] = useState("overview");

  // Permissions:
  // - Milestones: Both Adviser and Officers (and Operator) can add/modify
  const canManageMilestones =
    currentRole === "Department Adviser" || currentRole === "BSHM Officer" || currentRole === "Operator";
  // - Officers/Announcements: Officer & Operator
  const canManageOfficersAndAnnouncements =
    currentRole === "Operator" || currentRole === "BSHM Officer";
  const canManageAnnouncements =
    currentRole === "Operator" || currentRole === "BSHM Officer" || currentRole === "Department Adviser";

  const total = concerns.length;
  const pending = concerns.filter((c) => c.status !== "Resolved").length;
  const resolved = concerns.filter((c) => c.status === "Resolved").length;
  const totalMilestones = (milestones || []).length;
  const resolutionRate = total === 0 ? 0 : Math.round((resolved / total) * 100);
  const received = concerns.filter((c) => c.status === "Received").length;
  const underReview = concerns.filter((c) => c.status === "Under Review").length;
  const concernChartTotal = total || 1;
  const concernChart = `conic-gradient(var(--mint) 0 ${resolved / concernChartTotal * 100}%, var(--gold-light) ${resolved / concernChartTotal * 100}% ${(resolved + underReview) / concernChartTotal * 100}%, var(--pink) ${(resolved + underReview) / concernChartTotal * 100}% 100%)`;
  const contentMetrics = [
    ["Milestones", totalMilestones, "stat-icon-blue"],
    ["Announcements", announcements.length, "stat-icon-pink"],
    ["Events", events.length, "stat-icon-gold"],
    ["Officers", officers.length, "stat-icon-green"],
  ];
  const maxContentMetric = Math.max(...contentMetrics.map(([, value]) => value), 1);
  const roleInfo = ROLE_INFO[currentRole] || ROLE_INFO["Department Adviser"];

  const handleLogout = () => {
    logout();
    showToast("You have been logged out.");
    navigate("/");
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annText.trim()) {
      showToast("Please complete the announcement.");
      return;
    }
    const announcement = {
      id: editingAnnouncementId || "ann-" + Date.now(),
      title: annTitle.trim(),
      text: annText.trim(),
      date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
    };
    if (editingAnnouncementId) {
      updateAnnouncement(announcement);
      showToast("Announcement updated successfully!");
    } else {
      addAnnouncement(announcement);
      showToast("Announcement published successfully!");
    }
    setAnnTitle("");
    setAnnText("");
    setEditingAnnouncementId(null);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncementId(announcement.id);
    setAnnTitle(announcement.title);
    setAnnText(announcement.text);
  };

  const handleDeleteAnnouncement = (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    deleteAnnouncement(id);
    if (editingAnnouncementId === id) {
      setEditingAnnouncementId(null);
      setAnnTitle("");
      setAnnText("");
    }
    showToast("Announcement deleted successfully!");
  };

  const handleSaveEvent = (event) => {
    if (eventModalData === "new") {
      addEvent(event);
      showToast("Event added successfully!");
    } else {
      updateEvent(event);
      showToast("Event updated successfully!");
    }
    setEventModalData(null);
  };

  const handleDeleteEvent = (id) => {
    deleteEvent(id);
    showToast("Event deleted successfully!");
    setEventModalData(null);
  };

  const handleSaveOfficer = (officerData) => {
    if (officerModalData === "new") {
      addOfficer(officerData);
      showToast(`Added ${officerData.name} to Organizational Chart!`);
    } else {
      updateOfficer(officerData);
      showToast(`Updated ${officerData.name} successfully!`);
    }
    setOfficerModalData(null);
  };

  const handleDeleteOfficer = (id) => {
    deleteOfficer(id);
    showToast("Officer removed from Organizational Chart.");
    setOfficerModalData(null);
  };

  const handleResetOfficers = () => {
    if (window.confirm("Reset all officers back to the default BSHM Council list?")) {
      resetOfficers();
      showToast("Organizational chart reset to default council.");
    }
  };

  const handleSaveMilestone = (data) => {
    if (milestoneModalData === "new") {
      addMilestone(data);
      showToast(`Milestone "${data.title}" published!`);
    } else {
      updateMilestone(data);
      showToast(`Milestone "${data.title}" updated successfully!`);
    }
    setMilestoneModalData(null);
  };

  const handleDeleteMilestone = (id) => {
    deleteMilestone(id);
    showToast("Milestone removed successfully.");
    setMilestoneModalData(null);
  };

  const filteredOfficers = (officers || []).filter(
    (o) =>
      o.name.toLowerCase().includes(officerFilter.toLowerCase()) ||
      o.position.toLowerCase().includes(officerFilter.toLowerCase()) ||
      (o.tierLevel && o.tierLevel.toLowerCase().includes(officerFilter.toLowerCase()))
  );

  const filteredMilestones = (milestones || []).filter(
    (m) =>
      m.title.toLowerCase().includes(milestoneFilter.toLowerCase()) ||
      m.category.toLowerCase().includes(milestoneFilter.toLowerCase()) ||
      (m.year && m.year.toLowerCase().includes(milestoneFilter.toLowerCase())) ||
      (m.date && m.date.toLowerCase().includes(milestoneFilter.toLowerCase()))
  );

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-brand">
          <div className="logo-icon">B</div>
          <span>BSHM <strong>Connect</strong></span>
        </div>
        <span className="sidebar-label">WORKSPACE</span>
        <nav className="dashboard-sidebar-links" aria-label="Staff dashboard navigation">
          <button className={dashboardSection === "overview" ? "active" : ""} onClick={() => setDashboardSection("overview")}><span>⌂</span> Overview</button>
          <button className={dashboardSection === "milestones" ? "active" : ""} onClick={() => setDashboardSection("milestones")}><span>✦</span> Milestones</button>
          {canManageOfficersAndAnnouncements && <button className={dashboardSection === "officers" ? "active" : ""} onClick={() => setDashboardSection("officers")}><span>♙</span> Officers</button>}
          {canManageAnnouncements && <button className={dashboardSection === "announcements" ? "active" : ""} onClick={() => setDashboardSection("announcements")}><span>▤</span> Announcements</button>}
          <button className={dashboardSection === "events" ? "active" : ""} onClick={() => setDashboardSection("events")}><span>◷</span> Events</button>
          <button className={dashboardSection === "concerns" ? "active" : ""} onClick={() => setDashboardSection("concerns")}><span>☷</span> Concern Inbox</button>
        </nav>
        <span className="sidebar-label sidebar-label-bottom">ACCOUNT</span>
        <div className="dashboard-sidebar-actions">
          <button type="button" onClick={() => navigate("/")}><span>↗</span> View website</button>
          <button type="button" onClick={handleLogout}><span>↪</span> Sign out</button>
        </div>
      </aside>
      <div className="dashboard-nav">
        <div className="logo">
          <div className="logo-icon">B</div>
          BSHM <span>Connect</span>
        </div>
        <div className="dashboard-nav-actions">
          <button className="btn btn-secondary btn-small" onClick={() => navigate("/")}>
            <span aria-hidden="true">↗</span> View Website
          </button>
          <button className="btn btn-danger btn-small" onClick={handleLogout}>
            <span aria-hidden="true">↪</span> Logout
          </button>
        </div>
      </div>

      <main className="dashboard-main" id="dashboard-overview" data-dashboard-section={dashboardSection}>
        <div className="dashboard-header dashboard-overview-only">
          <div className="dashboard-header-copy">
            <span className="dashboard-kicker">BSHM CONNECT / STAFF WORKSPACE</span>
            <h1>{currentRole} Dashboard</h1>
            <p>Manage department updates, people, and student concerns from one place.</p>
          </div>
          <div className="dashboard-header-meta">
            <span className="role-badge">{currentRole?.toUpperCase()}</span>
            <span className="dashboard-status"><i /> Session active</span>
          </div>
        </div>

        {/* STATS */}
        <div className="stats dashboard-overview-only">
          <div className="stat-card">
            <span className="stat-icon stat-icon-pink" aria-hidden="true">◌</span>
            <span className="stat-label">CONCERN QUEUE</span>
            <div className="stat-number">{total}</div>
            <p>Total student submissions</p>
            <div className="kpi-status"><i className="kpi-dot kpi-dot-pink" /> Live inbox</div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon-gold" aria-hidden="true">◷</span>
            <span className="stat-label">ACTION NEEDED</span>
            <div className="stat-number">{pending}</div>
            <p>Open concerns to review</p>
            <div className="kpi-meter"><span style={{ width: `${total ? Math.min((pending / total) * 100, 100) : 0}%` }} /></div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon-green" aria-hidden="true">✓</span>
            <span className="stat-label">SERVICE HEALTH</span>
            <div className="stat-number">{resolutionRate}%</div>
            <p>{resolved} resolved concern{resolved === 1 ? "" : "s"}</p>
            <div className="kpi-meter kpi-meter-green"><span style={{ width: `${resolutionRate}%` }} /></div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon-blue" aria-hidden="true">✦</span>
            <span className="stat-label">PROGRAM HIGHLIGHTS</span>
            <div className="stat-number">{totalMilestones}</div>
            <p>Published milestones</p>
            <div className="kpi-status"><i className="kpi-dot kpi-dot-blue" /> {events.length} upcoming event{events.length === 1 ? "" : "s"}</div>
          </div>
        </div>

        <section className="dashboard-analytics dashboard-overview-only" aria-label="Dashboard analytics">
          <div className="analytics-card analytics-status-card">
            <div className="analytics-card-heading"><span className="panel-kicker">OVERALL STATUS</span><h2>Concern performance</h2></div>
            <div className="analytics-status-layout">
              <div className="analytics-donut" style={{ background: concernChart }}><div><strong>{resolutionRate}%</strong><span>resolved</span></div></div>
              <div className="analytics-legend">
                <div><i className="legend-mint" /><span>Resolved</span><strong>{resolved}</strong></div>
                <div><i className="legend-gold" /><span>Under review</span><strong>{underReview}</strong></div>
                <div><i className="legend-pink" /><span>Received</span><strong>{received}</strong></div>
              </div>
            </div>
          </div>
          <div className="analytics-card analytics-inventory-card">
            <div className="analytics-card-heading"><span className="panel-kicker">CONTENT INVENTORY</span><h2>Department activity</h2></div>
            <div className="analytics-bars">
              {contentMetrics.map(([label, value, colorClass]) => (
                <div className="analytics-bar-row" key={label}>
                  <span>{label}</span><div className="analytics-bar-track"><i className={colorClass} style={{ width: `${(value / maxContentMetric) * 100}%` }} /></div><strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <nav className="dashboard-jump-nav dashboard-overview-only" aria-label="Dashboard sections">
          <span className="dashboard-jump-label">Jump to</span>
          <button type="button" onClick={() => setDashboardSection("milestones")}>Milestones</button>
          {canManageOfficersAndAnnouncements && <button type="button" onClick={() => setDashboardSection("officers")}>Officers</button>}
          {canManageAnnouncements && <button type="button" onClick={() => setDashboardSection("announcements")}>Announcements</button>}
          <button type="button" onClick={() => setDashboardSection("events")}>Events</button>
          <button type="button" onClick={() => setDashboardSection("concerns")}>Concerns</button>
        </nav>

        {/* MILESTONES & ACHIEVEMENTS MANAGEMENT (Adviser, Officer, & Operator) */}
        {canManageMilestones && (
          <div className={`dashboard-panel dashboard-view-panel ${dashboardSection === "milestones" ? "dashboard-panel-active" : ""}`} id="dashboard-milestones">
            <div className="dashboard-panel-header">
              <div>
                <span className="panel-kicker">ACHIEVEMENTS</span>
                <h2>🏆 Milestones & Achievements Management</h2>
                <p style={{ color: "#888", fontSize: "14px" }}>
                  Feature accomplishments, competitions, awards, and event highlights with pictures (up to 10MB).
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-small"
                onClick={() => setMilestoneModalData("new")}
              >
                ➕ Add New Milestone
              </button>
            </div>

            {/* SEARCH FILTER */}
            <div className="dashboard-toolbar">
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: "340px", padding: "10px 14px", fontSize: "14px" }}
                placeholder="🔍 Search milestones by title or category..."
                value={milestoneFilter}
                onChange={(e) => setMilestoneFilter(e.target.value)}
              />
            </div>

            {/* MILESTONES LIST */}
            <div className="dashboard-milestone-grid">
              {filteredMilestones.length === 0 ? (
                <div className="empty-state">No milestones registered yet.</div>
              ) : (
                filteredMilestones.map((m) => {
                  const imgCount = Array.isArray(m.images) ? m.images.length : 0;
                  return (
                    <div className="dashboard-milestone-card" key={m.id}>
                      <div className="db-ms-top">
                        <span className="db-ms-icon">{m.badgeIcon || "🏆"}</span>
                        <div className="db-ms-meta">
                          <span className="db-ms-cat">{m.category}</span>
                          <span className="db-ms-date">{m.date}</span>
                        </div>
                      </div>

                      <h3 className="db-ms-title">{m.title}</h3>
                      <p className="db-ms-desc">{m.description}</p>

                      <div className="db-ms-footer">
                        <span className="db-ms-img-badge">
                          📷 {imgCount} {imgCount === 1 ? "Photo" : "Photos"}
                        </span>
                        <button
                          type="button"
                          className="btn btn-primary btn-small"
                          onClick={() => setMilestoneModalData(m)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* DYNAMIC OFFICER & ORG CHART MANAGEMENT (For Officers & Operator) */}
        {canManageOfficersAndAnnouncements && (
          <div className={`dashboard-panel dashboard-view-panel ${dashboardSection === "officers" ? "dashboard-panel-active" : ""}`} id="dashboard-officers">
            <div className="dashboard-panel-header">
              <div>
                <span className="panel-kicker">PEOPLE & ROLES</span>
                <h2>🏛️ Organizational Chart & Officers</h2>
                <p style={{ color: "#888", fontSize: "14px" }}>
                  Add, modify, or remove officers and their pictures dynamically.
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn btn-primary btn-small"
                  onClick={() => setOfficerModalData("new")}
                >
                  ➕ Add New Officer
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={handleResetOfficers}
                  title="Restore default officers list"
                >
                  🔄 Reset Defaults
                </button>
              </div>
            </div>

            {/* SEARCH FILTER */}
            <div className="dashboard-toolbar">
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: "340px", padding: "10px 14px", fontSize: "14px" }}
                placeholder="🔍 Search officer by name or position..."
                value={officerFilter}
                onChange={(e) => setOfficerFilter(e.target.value)}
              />
            </div>

            {/* OFFICERS LIST / CARDS */}
            <div className="officer-photo-grid">
              {filteredOfficers.length === 0 ? (
                <div className="empty-state">No officers match your search.</div>
              ) : (
                filteredOfficers.map((o) => {
                  const photo = o.photo || officerPhotos?.[o.name];
                  return (
                    <div className="officer-photo-card" key={o.id || o.name}>
                      <div className="officer-photo-avatar">
                        {photo ? (
                          <img src={photo} alt={o.name} className="officer-photo-img" />
                        ) : (
                          <div className="officer-photo-initials">{getInitials(o.name)}</div>
                        )}
                        {o.icon && <span className="officer-card-icon-tag">{o.icon}</span>}
                      </div>

                      <div className="officer-photo-info">
                        <div className="officer-photo-tier">{o.tierLevel || "Tier"}</div>
                        <div className="officer-photo-pos">{o.position}</div>
                        <div className="officer-photo-name">{o.name}</div>
                        <div className="officer-photo-tag">{o.roleTag || o.position}</div>
                      </div>

                      <div className="officer-photo-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-small"
                          onClick={() => setOfficerModalData(o)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ANNOUNCEMENT MANAGEMENT (Officers & Operator) */}
        {canManageAnnouncements && (
          <div className={`dashboard-panel dashboard-view-panel announcement-panel ${dashboardSection === "announcements" ? "dashboard-panel-active" : ""}`} id="dashboard-announcements">
          <div className="dashboard-panel-title">
            <span className="panel-kicker">BROADCAST</span>
            <h2>{editingAnnouncementId ? "✏️ Edit Announcement" : "📢 Create Announcement"}</h2>
          </div>
            <form onSubmit={handlePublish}>
              <div className="form-group">
                <label htmlFor="annTitle">Title</label>
                <input
                  id="annTitle"
                  className="form-control"
                  placeholder="Announcement title"
                  maxLength={100}
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="annText">Details</label>
                <textarea
                  id="annText"
                  className="form-control"
                  placeholder="Announcement details"
                  value={annText}
                  onChange={(e) => setAnnText(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {editingAnnouncementId ? "Save Changes" : "Publish Announcement"}
              </button>
              {editingAnnouncementId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingAnnouncementId(null);
                    setAnnTitle("");
                    setAnnText("");
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
            <div className="dashboard-announcement-list">
              <div className="dashboard-list-heading">Published announcements</div>
              {announcements.length === 0 ? (
                <div className="empty-state">No announcements published yet.</div>
              ) : (
                announcements.map((announcement) => (
                  <article className="dashboard-announcement-item" key={announcement.id}>
                    <div className="dashboard-announcement-copy">
                      <span>{announcement.date}</span>
                      <h3>{announcement.title}</h3>
                      <p>{announcement.text}</p>
                    </div>
                    <div className="dashboard-announcement-actions">
                      <button
                        type="button"
                        className="icon-action icon-action-edit"
                        aria-label={`Edit ${announcement.title}`}
                        title="Edit announcement"
                        onClick={() => handleEditAnnouncement(announcement)}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="icon-action icon-action-delete"
                        aria-label={`Delete ${announcement.title}`}
                        title="Delete announcement"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {/* EVENT MANAGEMENT */}
        <div className={`dashboard-panel dashboard-view-panel event-management-panel ${dashboardSection === "events" ? "dashboard-panel-active" : ""}`} id="dashboard-events">
          <div className="dashboard-panel-header">
            <div><span className="panel-kicker">SCHEDULE</span><h2>📅 Events & Programs</h2><p>Keep students updated with upcoming department activities.</p></div>
            <button type="button" className="btn btn-primary btn-small" onClick={() => setEventModalData("new")}>＋ Add Event</button>
          </div>
          <div className="dashboard-event-list">
            {(events || []).length === 0 ? <div className="empty-state">No events available yet.</div> : (events || []).map((event) => (
              <article className="dashboard-event-item" key={event.id}>
                <div><span className="dashboard-event-date">{event.date}</span><h3>{event.title}</h3><p>{event.description}</p></div>
                <div className="dashboard-event-actions">
                  <button type="button" className="icon-action icon-action-edit" aria-label={`Edit ${event.title}`} title="Edit event" onClick={() => setEventModalData(event)}>✎</button>
                  <button type="button" className="icon-action icon-action-delete" aria-label={`Delete ${event.title}`} title="Delete event" onClick={() => handleDeleteEvent(event.id)}>🗑</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* CONCERN INBOX */}
        <div className={`dashboard-panel dashboard-view-panel concern-panel ${dashboardSection === "concerns" ? "dashboard-panel-active" : ""}`} id="dashboard-concerns">
          <div className="dashboard-panel-title">
            <span className="panel-kicker">INBOX</span>
            <h2>💬 Concern Inbox</h2>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {concerns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      No student concerns have been submitted yet.
                    </td>
                  </tr>
                ) : (
                  concerns.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.name}</td>
                      <td>{c.category}</td>
                      <td>{c.subject}</td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => setSelectedConcern(c)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROLE INFO */}
        <div className="dashboard-panel dashboard-view-panel responsibilities-panel dashboard-overview-panel">
          <div className="dashboard-panel-title">
            <span className="panel-kicker">ACCESS PROFILE</span>
            <h2>🛡️ Your Responsibilities</h2>
          </div>
          <p>
            <strong>{roleInfo.title}</strong>
          </p>
          <br />
          <ul className="role-list">
            {roleInfo.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </main>

      {/* CONCERN DETAIL MODAL */}
      {selectedConcern && (
        <ConcernModal
          concern={concerns.find((c) => c.id === selectedConcern.id)}
          onClose={() => setSelectedConcern(null)}
        />
      )}

      {/* OFFICER ADD/EDIT MODAL */}
      {officerModalData && (
        <OfficerModal
          officer={officerModalData === "new" ? null : officerModalData}
          onClose={() => setOfficerModalData(null)}
          onSave={handleSaveOfficer}
          onDelete={handleDeleteOfficer}
        />
      )}

      {/* MILESTONE ADD/EDIT MODAL */}
      {milestoneModalData && (
        <MilestoneModal
          milestone={milestoneModalData === "new" ? null : milestoneModalData}
          authorRole={currentRole}
          onClose={() => setMilestoneModalData(null)}
          onSave={handleSaveMilestone}
          onDelete={handleDeleteMilestone}
        />
      )}

      {eventModalData && (
        <EventModal
          event={eventModalData === "new" ? null : eventModalData}
          onClose={() => setEventModalData(null)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}
