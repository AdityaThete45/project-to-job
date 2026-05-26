import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentProfile, getStudentTrustMetrics, getStudentAISummary } from "../services/api";
import { getScoreColor, getTrustRankStyle } from "../hooks/utils";
import ProgressBar from "../components/ProgressBar";
import { ArrowLeft, Sparkles, ShieldAlert, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";

export default function StudentProfile({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [trust, setTrust] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setSummaryLoading(true);
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

    getStudentAISummary(id)
      .then(res => setAiSummary(res))
      .catch(err => console.error("AI Summary error:", err))
      .finally(() => setSummaryLoading(false));
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

      {/* AI Recruiter Intelligence Section */}
      {summaryLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 text-center text-slate-600 dark:text-slate-400 shadow-sm">
          <Sparkles className="animate-spin text-indigo-500 dark:text-indigo-400 mx-auto mb-2" size={20} />
          <span className="text-sm font-semibold">Generating Technical Recruiting Summary...</span>
        </div>
      ) : aiSummary ? (
        <div className="bg-slate-50 dark:bg-gradient-to-br dark:from-indigo-950/20 dark:to-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl p-6 mb-6 text-slate-800 dark:text-slate-200 shadow-md">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <Sparkles className="text-indigo-550 dark:text-indigo-400 animate-pulse" size={18} />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">AI Recruiter Intelligence</h4>
            <span className="ml-auto text-xs px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/20 rounded-md">
              {aiSummary.readinessRating}
            </span>
          </div>

          {/* Technical Summary */}
          <div className="mb-5">
            <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 font-mono">CTO Summary</h5>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{aiSummary.technicalSummary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Strengths */}
            <div className="bg-white dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
              <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <CheckCircle size={13} className="text-emerald-500 dark:text-emerald-400" /> Key Strengths
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {aiSummary.strengths?.map((s, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-indigo-500 dark:text-indigo-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
              <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Lightbulb size={13} className="text-indigo-550 dark:text-indigo-400" /> Focus Areas
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {aiSummary.weaknesses?.map((w, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-indigo-500 dark:text-indigo-400">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Authenticity Audit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border flex gap-3 ${
              aiSummary.authenticityAudit?.suspiciousActivityDetected
                ? "bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-200"
                : "bg-emerald-500/5 border-emerald-500/20 text-emerald-805 dark:text-emerald-200"
            }`}>
              <div className="mt-0.5">
                {aiSummary.authenticityAudit?.suspiciousActivityDetected ? (
                  <ShieldAlert size={18} className="text-rose-500 dark:text-rose-400 animate-bounce" />
                ) : (
                  <CheckCircle size={18} className="text-emerald-500 dark:text-emerald-400" />
                )}
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider">Authenticity Audit</h5>
                <p className="text-xs opacity-90 mt-1">{aiSummary.authenticityAudit?.explanation}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-850 flex gap-3">
              <div className="mt-0.5 text-indigo-500 dark:text-indigo-400">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Hiring Recommendation</h5>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{aiSummary.hiringRecommendation}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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