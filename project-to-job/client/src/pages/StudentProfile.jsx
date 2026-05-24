import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentProfile, getStudentTrustMetrics } from "../services/api";
import { getScoreColor, getTrustRankStyle } from "../hooks/utils";
import ProgressBar from "../components/ProgressBar";
import { ArrowLeft } from "lucide-react";

export default function StudentProfile({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [trust, setTrust] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStudentProfile(id),
      getStudentTrustMetrics(id)
    ])
      .then(([profileData, trustData]) => {
        setData(profileData);
        setTrust(trustData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40, color: "var(--text-muted)" }}>Loading…</div>;
  if (!data?.student) return (
    <div style={{ padding: 40 }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
      <div className="empty-state" style={{ marginTop: 40 }}>
        <div className="empty-state-icon">❌</div>
        <h3>Student not found</h3>
      </div>
    </div>
  );

  const { student, projects = [] } = data;
  const rankStyle = getTrustRankStyle(student.trustRank);

  return (
    <div style={{ maxWidth: 860, padding: "0 4px" }}>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="profile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="profile-name">{student.name}</div>
            <div className="profile-meta">
              {student.college || "Student"} · Class of {student.graduationYear || "N/A"}
            </div>
          </div>
        </div>

        {student.trustRank && student.trustRank !== "Unranked" && (
          <span className="trust-rank-badge" style={{ ...rankStyle }}>🏆 {student.trustRank}</span>
        )}

        {student.skills?.length > 0 && (
          <div className="tags" style={{ marginTop: 14 }}>
            {student.skills.map((s, i) => (
              <span key={i} className="tag" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Trust Metrics */}
      {trust && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Projects", value: trust.totalProjects },
            { label: "Avg Proof Score", value: trust.avgProofScore },
            { label: "Verified", value: trust.verifiedProjects },
            { label: "Shortlisted By", value: trust.totalShortlists },
            { label: "Interviews", value: trust.totalInterviews },
            { label: "Acceptance Rate", value: `${trust.acceptanceRate}%` }
          ].map(({ label, value }) => (
            <div key={label} className="card" style={{ textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Projects</h3>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💼</div>
          <h3>No projects yet</h3>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <div
              key={p._id}
              className="project-card"
              onClick={() => navigate(`/company/project/${p._id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="project-body" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>{p.title}</h3>
                  {p.isVerified && (
                    <span className="verified-badge" style={{ position: "static", fontSize: 10, padding: "2px 7px" }}>✓</span>
                  )}
                </div>
                <div className="tags" style={{ marginBottom: 12 }}>
                  {p.techStack?.slice(0, 3).map((t, i) => <span key={i} className="tag">{t}</span>)}
                </div>
                <div className="score-row">
                  <span>Proof Score</span>
                  <strong style={{ color: getScoreColor(p.proofScore) }}>{p.proofScore}/100</strong>
                </div>
                <ProgressBar value={p.proofScore} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}