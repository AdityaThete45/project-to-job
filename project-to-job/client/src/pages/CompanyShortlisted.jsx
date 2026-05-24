import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getShortlist, removeFromShortlist } from "../services/api";
import { getScoreColor, formatDate } from "../hooks/utils";
import ProgressBar from "../components/ProgressBar";
import { Trash2, ExternalLink } from "lucide-react";

export default function CompanyShortlisted({ token }) {
  const [shortlisted, setShortlisted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const navigate = useNavigate();

  useEffect(() => { fetchShortlisted(); }, []);

  const fetchShortlisted = async () => {
    try {
      setLoading(true);
      const data = await getShortlist();
      setShortlisted(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e, projectId) => {
    e.stopPropagation();
    setRemoving(prev => ({ ...prev, [projectId]: true }));
    try {
      await removeFromShortlist(projectId);
      setShortlisted(prev => prev.filter(s => s.project?._id !== projectId));
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(prev => ({ ...prev, [projectId]: false }));
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Shortlisted Candidates</h1>
        <p className="page-subtitle">{shortlisted.length} candidate{shortlisted.length !== 1 ? "s" : ""} saved.</p>
      </div>

      {loading && (
        <div className="projects-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 18, width: "70%", marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 6, borderRadius: 99 }} />
            </div>
          ))}
        </div>
      )}

      {!loading && shortlisted.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <h3>No candidates shortlisted</h3>
          <p>Shortlist candidates from Search or Project Detail to see them here.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/company/search")}>
            Browse Projects
          </button>
        </div>
      )}

      <div className="projects-grid">
        {shortlisted.map(item => {
          const project = item.project;
          if (!project) return null;
          const score = project.proofScore || 0;

          return (
            <div
              key={item._id}
              className="project-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/company/project/${project._id}`)}
            >
              <div className="project-body" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, flex: 1, marginRight: 8 }}>{project.title}</h3>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ padding: "4px 8px", flexShrink: 0 }}
                    onClick={e => handleRemove(e, project._id)}
                    disabled={removing[project._id]}
                    title="Remove from shortlist"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>
                  by <strong>{project.student?.name || item.student?.name}</strong>
                </p>

                {project.techStack?.length > 0 && (
                  <div className="tags" style={{ marginBottom: 12 }}>
                    {project.techStack.slice(0, 3).map((t, i) => (
                      <span key={i} className="tag">{t}</span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="tag" style={{ background: "#f1f5f9", color: "#64748b" }}>+{project.techStack.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="score-row">
                  <span>Proof Score</span>
                  <strong style={{ color: getScoreColor(score) }}>{score}/100</strong>
                </div>
                <ProgressBar value={score} />

                {project.isVerified && (
                  <div style={{ marginTop: 10 }}>
                    <span className="verified-badge" style={{ position: "static" }}>✓ Verified Project</span>
                  </div>
                )}

                <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
                  Saved {formatDate(item.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}