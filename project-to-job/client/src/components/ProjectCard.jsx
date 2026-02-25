import "../styles/dashboard.css";

export default function ProjectCard({ project, interestCount = 0, onClick }) {
  const interestText =
    interestCount === 1
      ? "1 Company Interested"
      : `${interestCount} Companies Interested`;

  const score = project.proofScore || 0;

  return (
    <div
      className="project-card"
      onClick={() => onClick && onClick(project)}
    >
      {/* IMAGE HEADER */}
      <div className="project-image-wrapper">
        {project.videoLink && (
          <img
            src={project.videoLink.replace(
              "/video/upload/",
              "/video/upload/so_0,f_jpg/"
            )}
            alt="Project preview"
            className="project-image"
          />
        )}

        <div className="image-overlay" />

        <div className="image-content">
          <h3 className="project-title">{project.title}</h3>

          {interestCount > 0 && (
            <p className="project-interest">
              {interestText}
            </p>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="project-body">
        <p className="project-description">
          {project.description?.slice(0, 90)}...
        </p>

        <div className="tags">
          {project.techStack?.map((tech, index) => (
            <span key={index} className="tag">
              {tech}
            </span>
          ))}
        </div>

        {/* 🔥 PROOF SCORE (Replaced Authenticity) */}
        {/* 🔥 PROOF ENGINE SCORE */}
<div className="auth-row">
  <span>Proof Engine Score</span>
  <span>{score}/100</span>
</div>

<div className="progress-bar">
  <div
    className="progress-fill"
    style={{
      width: `${score}%`,
      background:
        score >= 75
          ? "#16a34a"
          : score >= 50
          ? "#f59e0b"
          : "#dc2626"
    }}
  />
</div>
      </div>
    </div>
  );
}