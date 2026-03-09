import "../styles/dashboard.css";
import ProgressBar from "./ProgressBar";

export default function ProjectCard({ project, interestCount = 0, onClick }) {
  const score = project.proofScore || 0;

  return (
    <div
      className="project-card upgraded"
      onClick={() => onClick && onClick(project)}
    >
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

        {project.isVerified && (
          <div className="verified-badge">
            ✔ Verified
          </div>
        )}

        <div className="image-overlay" />

        <div className="image-content">
          <h3>{project.title}</h3>
        </div>
      </div>

      <div className="project-body">
        <p className="project-description">
          {project.description?.slice(0, 90)}...
        </p>

        <div className="tags">
          {project.techStack?.slice(0, 4).map((tech, i) => (
            <span key={i} className="tag">
              {tech}
            </span>
          ))}
        </div>

        <div className="score-row">
          <span>Proof Score</span>
          <strong>{score}/100</strong>
        </div>

        <ProgressBar value={score} />
      </div>
    </div>
  );
}