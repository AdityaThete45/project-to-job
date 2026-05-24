import ProgressBar from "./ProgressBar";
import { getScoreColor, getVideoThumbnail } from "../hooks/utils";

export default function ProjectCard({ project, interestCount = 0, onClick }) {
  const score = project.proofScore || 0;
  const thumb = getVideoThumbnail(project.videoLink);

  return (
    <div className="project-card" onClick={() => onClick?.(project)}>
      <div className="project-thumb">
        {thumb ? (
          <img src={thumb} alt={project.title} />
        ) : (
          <div className="project-thumb-placeholder">💻</div>
        )}
        <div className="project-thumb-overlay" />

        {project.isVerified && (
          <div className="verified-badge">✓ Verified</div>
        )}

        <div className="thumb-title">{project.title}</div>
      </div>

      <div className="project-body">
        {interestCount > 0 && (
          <div className="interest-badge">
            🔥 {interestCount} {interestCount === 1 ? "company" : "companies"} interested
          </div>
        )}

        <p className="project-description">
          {project.description?.slice(0, 85)}{project.description?.length > 85 ? "…" : ""}
        </p>

        <div className="tags">
          {project.techStack?.slice(0, 3).map((tech, i) => (
            <span key={i} className="tag">{tech}</span>
          ))}
          {project.techStack?.length > 3 && (
            <span className="tag" style={{ background: "#f1f5f9", color: "#64748b" }}>
              +{project.techStack.length - 3}
            </span>
          )}
        </div>

        <div className="score-row">
          <span>Proof Score</span>
          <strong style={{ color: getScoreColor(score) }}>{score}/100</strong>
        </div>
        <ProgressBar value={score} />
      </div>
    </div>
  );
}