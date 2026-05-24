import { useEffect, useState } from "react";
import { getCompanyInterviews, scheduleInterview } from "../services/api";
import { useNavigate } from "react-router-dom";
import { formatDate, getTrustRankStyle } from "../hooks/utils";
import { Clock, CheckCircle, XCircle, CalendarDays, ExternalLink } from "lucide-react";

const STATUS_FILTERS = ["all", "pending", "accepted", "rejected", "scheduled"];

export default function CompanyInterviews({ token }) {
  const [interviews, setInterviews] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ scheduledAt: "", meetingLink: "", companyNotes: "" });
  const [scheduling, setScheduling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchInterviews(); }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const data = await getCompanyInterviews();
      setInterviews(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleModal) return;
    setScheduling(true);
    try {
      await scheduleInterview(scheduleModal._id, scheduleForm);
      setScheduleModal(null);
      setScheduleForm({ scheduledAt: "", meetingLink: "", companyNotes: "" });
      fetchInterviews();
    } catch (err) {
      alert(err.message);
    } finally {
      setScheduling(false);
    }
  };

  const filtered = activeFilter === "all"
    ? interviews
    : interviews.filter(i => i.status === activeFilter);

  const counts = STATUS_FILTERS.reduce((acc, s) => {
    acc[s] = s === "all" ? interviews.length : interviews.filter(i => i.status === s).length;
    return acc;
  }, {});

  const StatusIcon = ({ status }) => {
    if (status === "pending") return <Clock size={12} />;
    if (status === "accepted") return <CheckCircle size={12} />;
    if (status === "rejected") return <XCircle size={12} />;
    if (status === "scheduled") return <CalendarDays size={12} />;
    return null;
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Interview Requests</h1>
        <p className="page-subtitle">Track all your outreach to candidates.</p>
      </div>

      {/* Filter Tabs */}
      <div className="filters-row">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            className={`filter-chip ${activeFilter === s ? "active" : ""}`}
            onClick={() => setActiveFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {counts[s] > 0 && (
              <span style={{ marginLeft: 6, background: activeFilter === s ? "var(--accent)" : "var(--border)", color: activeFilter === s ? "white" : "var(--text-secondary)", borderRadius: 99, padding: "1px 6px", fontSize: 11 }}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading interviews…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No {activeFilter !== "all" ? activeFilter : ""} interviews</h3>
          <p>Send interview requests from the Search or Project Detail page.</p>
        </div>
      ) : (
        filtered.map(i => {
          const student = i.student;
          const project = i.project;
          const rankStyle = getTrustRankStyle(student?.trustRank);

          return (
            <div key={i._id} className="interview-card">
              <div className="interview-header">
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>
                      {student?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{student?.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {student?.college || "Student"}
                        {student?.trustRank && student.trustRank !== "Unranked" && (
                          <span className="trust-rank-badge" style={{ ...rankStyle, fontSize: 10, marginLeft: 8, padding: "2px 7px" }}>
                            {student.trustRank}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginLeft: 46 }}>
                    Project:
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ marginLeft: 8, padding: "2px 8px", fontSize: 12 }}
                      onClick={() => navigate(`/company/project/${project?._id}`)}
                    >
                      {project?.title} <ExternalLink size={11} style={{ marginLeft: 4 }} />
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span className={`status-badge status-${i.status}`}>
                    <StatusIcon status={i.status} /> {i.status}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(i.createdAt)}</span>
                </div>
              </div>

              {i.message && (
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "10px 0 0 46px", fontStyle: "italic" }}>
                  "{i.message}"
                </p>
              )}

              {i.status === "scheduled" && i.scheduledAt && (
                <div style={{ marginTop: 10, marginLeft: 46, padding: "10px 14px", background: "var(--accent-light)", borderRadius: "var(--radius)", fontSize: 13 }}>
                  📅 <strong>Scheduled:</strong> {new Date(i.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  {i.meetingLink && (
                    <> · <a href={i.meetingLink} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>Join Meeting</a></>
                  )}
                </div>
              )}

              {i.status === "accepted" && (
                <div style={{ marginTop: 12, marginLeft: 46 }}>
                  <button
                    className="btn btn-accent btn-sm"
                    onClick={() => { setScheduleModal(i); setScheduleForm({ scheduledAt: "", meetingLink: "", companyNotes: "" }); }}
                  >
                    <CalendarDays size={13} /> Schedule Interview
                  </button>
                </div>
              )}

              {i.studentNotes && (
                <div style={{ marginTop: 8, marginLeft: 46, fontSize: 13, color: "var(--text-secondary)" }}>
                  <strong>Student's note:</strong> {i.studentNotes}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: "100%", maxWidth: 480, boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Schedule Interview</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
              with <strong>{scheduleModal.student?.name}</strong> for <strong>{scheduleModal.project?.title}</strong>
            </p>

            <form onSubmit={handleSchedule}>
              <div className="form-group">
                <label className="form-label">Date & Time *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={scheduleForm.scheduledAt}
                  onChange={e => setScheduleForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Meeting Link (Zoom / Meet / Teams)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://zoom.us/j/..."
                  value={scheduleForm.meetingLink}
                  onChange={e => setScheduleForm(f => ({ ...f, meetingLink: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes to student (optional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Any preparation notes or instructions…"
                  value={scheduleForm.companyNotes}
                  onChange={e => setScheduleForm(f => ({ ...f, companyNotes: e.target.value }))}
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="submit" className="btn btn-primary" disabled={scheduling} style={{ flex: 1 }}>
                  {scheduling ? "Scheduling…" : "Confirm Schedule"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setScheduleModal(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}