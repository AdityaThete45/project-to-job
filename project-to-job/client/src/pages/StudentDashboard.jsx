import { useEffect, useState } from "react";
import {
  getMyProjects, getMyInterviews, getStudentShortlists, getStudentTrustMetrics, getMyProfile, updateInterviewStatus
} from "../services/api";
import { getUserIdFromToken, getScoreColor, formatDate, getTrustRankStyle } from "../hooks/utils";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";
import AddProject from "./AddProject";
import { SkeletonCard, SkeletonStat } from "../components/Skeleton";
import ProgressBar from "../components/ProgressBar";
import {
  Folder, MessageSquare, Star, Award, GitBranch, BarChart2, CheckCircle, Clock, XCircle
} from "lucide-react";

const MENU = [
  { key: "dashboard", label: "Dashboard" },
  { key: "projects", label: "My Projects" },
  { key: "interviews", label: "Interview Requests" },
  { key: "shortlists", label: "Shortlisted By" },
  { key: "profile", label: "My Profile" }
];

export default function StudentDashboard({ token, userId: propUserId, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [shortlists, setShortlists] = useState([]);
  const [trust, setTrust] = useState(null);
  const [profile, setProfile] = useState(null);
  const [active, setActive] = useState("dashboard");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const userId = propUserId || getUserIdFromToken(token);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [proj, ints, sl, trustData, profileData] = await Promise.allSettled([
        getMyProjects(),
        getMyInterviews(),
        getStudentShortlists(),
        userId ? getStudentTrustMetrics(userId) : Promise.resolve(null),
        getMyProfile()
      ]);

      setProjects(proj.value || []);
      setInterviews(ints.value || []);
      setShortlists(sl.value || []);
      setTrust(trustData.value || null);
      setProfile(profileData.value || null);
    } catch (err) {
      console.error("fetchAll error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewUpdate = async (id, status) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await updateInterviewStatus(id, { status });
      fetchAll();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const pending = interviews.filter(i => i.status === "pending").length;
  const interestMap = {};
  shortlists.forEach(s => {
    const id = s.project?._id;
    if (id) interestMap[id] = (interestMap[id] || 0) + 1;
  });

  // ===== PROJECT DETAIL VIEW =====
  if (selectedProject) {
    return (
      <div className="dashboard">
        <Sidebar menuItems={MENU} active={active} setActive={(k) => { setActive(k); setSelectedProject(null); }} onLogout={onLogout} />
        <div className="main">
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => setSelectedProject(null)}>← Back</button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.4px" }}>{selectedProject.title}</h1>
            {selectedProject.isVerified && (
              <span className="verified-badge" style={{ position: "static" }}>✓ Verified</span>
            )}
          </div>

          {interestMap[selectedProject._id] > 0 && (
            <p className="interest-badge" style={{ marginBottom: 16 }}>
              🔥 {interestMap[selectedProject._id]} {interestMap[selectedProject._id] === 1 ? "company" : "companies"} interested
            </p>
          )}

          {selectedProject.videoLink && (
            <video controls src={selectedProject.videoLink} style={{ width: "100%", borderRadius: 12, marginBottom: 20, maxHeight: 460 }} />
          )}

          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>{selectedProject.description}</p>

          <div className="tags" style={{ marginBottom: 20 }}>
            {selectedProject.techStack?.map((t, i) => <span key={i} className="tag">{t}</span>)}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="score-row" style={{ marginBottom: 10 }}>
              <span style={{ fontWeight: 600 }}>Proof Score</span>
              <strong style={{ color: getScoreColor(selectedProject.proofScore) }}>{selectedProject.proofScore}/100</strong>
            </div>
            <ProgressBar value={selectedProject.proofScore} height={8} />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {selectedProject.githubLink && (
              <a href={selectedProject.githubLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">💻 GitHub</a>
            )}
            {selectedProject.demoLink && (
              <a href={selectedProject.demoLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">🚀 Live Demo</a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar menuItems={MENU} active={active} setActive={setActive} onLogout={onLogout} />

      <div className="main">

        {/* ===== DASHBOARD ===== */}
        {active === "dashboard" && (
          <>
            <div className="page-header">
              <h1 className="page-title">Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋</h1>
              <p className="page-subtitle">Here's an overview of your hiring profile.</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              {loading ? (
                [1, 2, 3, 4].map(i => <SkeletonStat key={i} />)
              ) : (
                <>
                  <StatCard icon={<Folder size={18} />} value={trust?.totalProjects || 0} label="Total Projects" color="#6366f1" bg="#eef2ff" />
                  <StatCard icon={<MessageSquare size={18} />} value={pending} label="Pending Interviews" color="#d97706" bg="#fef3c7" />
                  <StatCard icon={<BarChart2 size={18} />} value={`${trust?.avgProofScore || 0}/100`} label="Avg Proof Score" color="#16a34a" bg="#dcfce7" />
                  <StatCard icon={<Star size={18} />} value={trust?.totalShortlists || 0} label="Times Shortlisted" color="#9333ea" bg="#f3e8ff" />
                </>
              )}
            </div>

            {/* Trust Rank */}
            {trust?.trustRank && !loading && (
              <div className="card" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
                <Award size={22} color="#6366f1" />
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 2 }}>Your Trust Rank</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{trust.trustRank}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-secondary)" }}>
                  {trust.acceptanceRate}% interview acceptance rate
                </div>
              </div>
            )}

            {/* Projects Grid */}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Projects</h3>
            {loading ? (
              <div className="projects-grid">{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>
            ) : projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💼</div>
                <h3>No projects yet</h3>
                <p>Upload your first project to start getting noticed by companies.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setActive("projects")}>
                  Add Project
                </button>
              </div>
            ) : (
              <div className="projects-grid">
                {projects.map(p => (
                  <ProjectCard key={p._id} project={p} interestCount={interestMap[p._id] || 0} onClick={setSelectedProject} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== PROJECTS ===== */}
        {active === "projects" && (
          <>
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h1 className="page-title">My Projects</h1>
                <p className="page-subtitle">Manage and showcase your work.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? "Cancel" : "+ Add Project"}
              </button>
            </div>

            {showAddForm && (
              <AddProject token={token} onProjectAdded={() => { fetchAll(); setShowAddForm(false); }} />
            )}

            {!loading && projects.length === 0 && !showAddForm ? (
              <div className="empty-state">
                <div className="empty-state-icon">🚀</div>
                <h3>No projects uploaded</h3>
                <p>Start by uploading your first project.</p>
              </div>
            ) : (
              <div className="projects-grid" style={{ marginTop: 24 }}>
                {projects.map(p => (
                  <ProjectCard key={p._id} project={p} interestCount={interestMap[p._id] || 0} onClick={setSelectedProject} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== INTERVIEWS ===== */}
        {active === "interviews" && (
          <>
            <div className="page-header">
              <h1 className="page-title">Interview Requests</h1>
              <p className="page-subtitle">Companies that want to interview you.</p>
            </div>

            {loading ? (
              <p style={{ color: "var(--text-muted)" }}>Loading…</p>
            ) : interviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h3>No interview requests yet</h3>
                <p>When companies request an interview, they'll appear here.</p>
              </div>
            ) : (
              interviews.map(i => (
                <div key={i._id} className="interview-card">
                  <div className="interview-header">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                        {i.company?.companyName || i.company?.name}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        Project: <strong>{i.project?.title}</strong> · {formatDate(i.createdAt)}
                      </div>
                    </div>
                    <span className={`status-badge status-${i.status}`}>
                      {i.status === "pending" && <Clock size={11} />}
                      {i.status === "accepted" && <CheckCircle size={11} />}
                      {i.status === "rejected" && <XCircle size={11} />}
                      {i.status}
                    </span>
                  </div>

                  {i.message && (
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "8px 0" }}>
                      "{i.message}"
                    </p>
                  )}

                  {i.status === "pending" && (
                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={actionLoading[i._id]}
                        onClick={() => handleInterviewUpdate(i._id, "accepted")}
                      >
                        {actionLoading[i._id] ? "…" : "✓ Accept"}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={actionLoading[i._id]}
                        onClick={() => handleInterviewUpdate(i._id, "rejected")}
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {i.status === "scheduled" && i.scheduledAt && (
                    <div style={{ marginTop: 8, fontSize: 13, color: "var(--accent)" }}>
                      📅 Scheduled: {new Date(i.scheduledAt).toLocaleString()}
                      {i.meetingLink && <> · <a href={i.meetingLink} target="_blank" rel="noreferrer">Join Meeting</a></>}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* ===== SHORTLISTS ===== */}
        {active === "shortlists" && (
          <>
            <div className="page-header">
              <h1 className="page-title">Shortlisted By Companies</h1>
              <p className="page-subtitle">Companies that saved your profile.</p>
            </div>

            {loading ? (
              <p style={{ color: "var(--text-muted)" }}>Loading…</p>
            ) : shortlists.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⭐</div>
                <h3>Not shortlisted yet</h3>
                <p>Upload high-quality projects to get shortlisted by companies.</p>
              </div>
            ) : (
              shortlists.map(s => (
                <div key={s._id} className="interview-card">
                  <div className="interview-header">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                        {s.company?.companyName || s.company?.name}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {s.company?.industry && `${s.company.industry} · `}Project: {s.project?.title}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(s.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ===== PROFILE ===== */}
        {active === "profile" && (
          <>
            <div className="page-header">
              <h1 className="page-title">My Profile</h1>
              <p className="page-subtitle">Your public hiring profile.</p>
            </div>

            {profile && (
              <div className="profile-header">
                <div className="profile-name">{profile.name}</div>
                <div className="profile-meta">{profile.email} · {profile.college || "College not set"}</div>
                {trust?.trustRank && (() => {
                  const rankStyle = getTrustRankStyle(trust.trustRank);
                  return (
                    <span className="trust-rank-badge" style={{ background: rankStyle.bg, color: rankStyle.color, border: `1px solid ${rankStyle.border}` }}>
                      🏆 {trust.trustRank}
                    </span>
                  );
                })()}
              </div>
            )}

            {trust && (
              <div className="stats-grid" style={{ marginBottom: 24 }}>
                <StatCard icon={<Folder size={17} />} value={trust.totalProjects} label="Projects" color="#6366f1" bg="#eef2ff" />
                <StatCard icon={<CheckCircle size={17} />} value={trust.verifiedProjects} label="Verified" color="#16a34a" bg="#dcfce7" />
                <StatCard icon={<Star size={17} />} value={trust.totalShortlists} label="Shortlisted" color="#9333ea" bg="#f3e8ff" />
                <StatCard icon={<MessageSquare size={17} />} value={`${trust.acceptanceRate}%`} label="Acceptance Rate" color="#d97706" bg="#fef3c7" />
              </div>
            )}

            {profile && (
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Profile Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {[
                    { label: "GitHub", value: profile.githubUsername },
                    { label: "Branch", value: profile.branch },
                    { label: "CGPA", value: profile.cgpa },
                    { label: "Graduation", value: profile.graduationYear },
                    { label: "LinkedIn", value: profile.linkedin }
                  ].map(({ label, value }) => value ? (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
                    </div>
                  ) : null)}
                </div>
                {profile.skills?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Skills</div>
                    <div className="tags">
                      {profile.skills.map((s, i) => <span key={i} className="tag">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}