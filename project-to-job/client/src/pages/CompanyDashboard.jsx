import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchProjects, getCompanyStats, addToShortlist, sendInterviewRequest, getTopCandidates } from "../services/api";
import { getScoreColor, getVideoThumbnail, getTrustRankStyle } from "../hooks/utils";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import { SkeletonCard, SkeletonStat } from "../components/Skeleton";
import { LayoutDashboard, Star, CalendarDays, Users, TrendingUp, Award } from "lucide-react";

export default function CompanyDashboard({ token }) {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [topCandidates, setTopCandidates] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [actionLoading, setActionLoading] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projData, statsData, topData] = await Promise.allSettled([
        searchProjects({ minScore: 0 }),
        getCompanyStats(),
        getTopCandidates(5)
      ]);

      const projs = (projData.value || []).sort((a, b) => b.proofScore - a.proofScore);
      setProjects(projs);
      setStats(statsData.value || null);
      setTopCandidates(topData.value || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (e, project) => {
    e.stopPropagation();
    const key = `sl-${project._id}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      await addToShortlist({ studentId: project.student._id, projectId: project._id });
      setShortlistedIds(prev => new Set([...prev, project._id]));
    } catch (err) {
      // already shortlisted or error - silently update state
      setShortlistedIds(prev => new Set([...prev, project._id]));
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleInterview = async (e, project) => {
    e.stopPropagation();
    const key = `int-${project._id}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      await sendInterviewRequest({
        studentId: project.student._id,
        projectId: project._id,
        message: "We are interested in your project and would like to discuss further."
      });
      setRequestedIds(prev => new Set([...prev, project.student._id]));
    } catch (err) {
      setRequestedIds(prev => new Set([...prev, project.student._id]));
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Top 5 highest proof score projects
  const featuredProjects = projects.slice(0, 6);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Company Dashboard</h1>
        <p className="page-subtitle">Discover top talent ranked by project authenticity.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {loading ? (
          [1, 2, 3, 4].map(i => <SkeletonStat key={i} />)
        ) : (
          <>
            <StatCard icon={<LayoutDashboard size={17} />} value={stats?.totalProjects || projects.length} label="Total Projects" color="#6366f1" bg="#eef2ff" />
            <StatCard icon={<Star size={17} />} value={stats?.shortlistCount || 0} label="Shortlisted" color="#9333ea" bg="#f3e8ff" />
            <StatCard icon={<CalendarDays size={17} />} value={stats?.interviewCount || 0} label="Interviews Sent" color="#d97706" bg="#fef3c7" />
            <StatCard icon={<Users size={17} />} value={stats?.acceptedCount || 0} label="Accepted" color="#16a34a" bg="#dcfce7" />
          </>
        )}
      </div>

      {/* Top Candidates */}
      {!loading && topCandidates.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Award size={18} color="#f59e0b" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Top Candidates by Trust Score</h3>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {topCandidates.map((c, i) => {
              const rankStyle = getTrustRankStyle(c.trustRank);
              return (
                <div key={c._id} className="card" style={{ minWidth: 200, flexShrink: 0, textAlign: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
                    {c.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{c.college || "Student"}</div>
                  <span className="trust-rank-badge" style={{ ...rankStyle, fontSize: 11 }}>{c.trustRank || "Unranked"}</span>
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-secondary)" }}>{c.totalProjects} projects · {c.verifiedProjects} verified</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project Feed */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <TrendingUp size={18} color="#6366f1" />
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Top Projects by Proof Score</h3>
      </div>

      {loading ? (
        <div className="projects-grid">{[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="projects-grid">
          {featuredProjects.map(project => {
            const thumb = getVideoThumbnail(project.videoLink);
            const isShortlisted = shortlistedIds.has(project._id);
            const isRequested = requestedIds.has(project.student?._id);

            return (
              <div
                key={project._id}
                className="project-card"
                onClick={() => navigate(`/company/project/${project._id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="project-thumb">
                  {thumb ? <img src={thumb} alt={project.title} /> : <div className="project-thumb-placeholder">💻</div>}
                  <div className="project-thumb-overlay" />
                  {project.isVerified && <div className="verified-badge">✓ Verified</div>}
                  <div className="thumb-title">{project.title}</div>
                </div>

                <div className="project-body">
                  {project.shortlistCount > 0 && (
                    <div className="interest-badge">
                      🔥 {project.shortlistCount} {project.shortlistCount === 1 ? "company" : "companies"} interested
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                    by <strong>{project.student?.name}</strong>
                    {project.student?.trustRank && project.student.trustRank !== "Unranked" && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>{project.student.trustRank}</span>
                    )}
                  </div>

                  <div className="tags">
                    {project.techStack?.slice(0, 3).map((t, i) => <span key={i} className="tag">{t}</span>)}
                  </div>

                  <div className="score-row">
                    <span>Proof Score</span>
                    <strong style={{ color: getScoreColor(project.proofScore) }}>{project.proofScore}/100</strong>
                  </div>
                  <ProgressBar value={project.proofScore} />

                  <div style={{ display: "flex", gap: 8, marginTop: 14 }} onClick={e => e.stopPropagation()}>
                    <button
                      className={`btn btn-sm ${isShortlisted ? "btn-secondary" : "btn-secondary"}`}
                      disabled={isShortlisted || actionLoading[`sl-${project._id}`]}
                      onClick={e => handleShortlist(e, project)}
                      style={{ flex: 1 }}
                    >
                      {isShortlisted ? "★ Saved" : "☆ Save"}
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={isRequested || actionLoading[`int-${project._id}`]}
                      onClick={e => handleInterview(e, project)}
                      style={{ flex: 1 }}
                    >
                      {isRequested ? "Sent ✓" : "Interview"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}