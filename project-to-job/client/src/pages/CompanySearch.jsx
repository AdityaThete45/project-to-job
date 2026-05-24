import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchProjects } from "../services/api";
import { getScoreColor, getVideoThumbnail } from "../hooks/utils";
import ProgressBar from "../components/ProgressBar";
import { SkeletonCard } from "../components/Skeleton";
import { Search, SlidersHorizontal, CheckCircle } from "lucide-react";

export default function CompanySearch({ token }) {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (verifiedOnly) params.verified = "true";
      if (minScore > 0) params.minScore = minScore;
      const data = await searchProjects(params);
      setProjects(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProjects, 400);
    return () => clearTimeout(timer);
  }, [verifiedOnly, minScore]);

  const filtered = projects
    .filter(p => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.techStack?.some(t => t.toLowerCase().includes(q)) ||
        p.student?.name?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.proofScore - a.proofScore);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Search Projects</h1>
        <p className="page-subtitle">Browse {projects.length} projects, ranked by Proof Score.</p>
      </div>

      {/* Search + Filter Bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            className="search-bar"
            style={{ paddingLeft: 42, marginBottom: 0 }}
            placeholder="Search by title, tech stack, or student name…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button
          className={`btn btn-secondary ${showFilters ? "active" : ""}`}
          style={{ flexShrink: 0 }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="card" style={{ marginBottom: 24, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={e => setVerifiedOnly(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <CheckCircle size={15} color="#16a34a" />
            Verified Projects Only
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>Min Proof Score:</span>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              style={{ width: 120 }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: getScoreColor(minScore), minWidth: 40 }}>{minScore}+</span>
          </div>
          {(verifiedOnly || minScore > 0) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setVerifiedOnly(false); setMinScore(0); }}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
        {!loading && `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
      </div>

      {loading ? (
        <div className="projects-grid">{[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map(project => {
            const thumb = getVideoThumbnail(project.videoLink);
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
                    <div className="interest-badge">🔥 {project.shortlistCount} interested</div>
                  )}
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                    by <strong>{project.student?.name}</strong>
                  </div>
                  <div className="tags">
                    {project.techStack?.slice(0, 3).map((t, i) => <span key={i} className="tag">{t}</span>)}
                  </div>
                  <div className="score-row">
                    <span>Proof Score</span>
                    <strong style={{ color: getScoreColor(project.proofScore) }}>{project.proofScore}/100</strong>
                  </div>
                  <ProgressBar value={project.proofScore} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}