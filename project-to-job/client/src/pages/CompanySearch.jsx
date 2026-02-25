import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CompanySearch({ token }) {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/company/search",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🔥 Sort by highest Proof Score first
      const sorted =
        (res.data || []).sort((a, b) => b.proofScore - a.proofScore);

      setProjects(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = projects
    .filter((p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.techStack.some((tech) =>
        tech.toLowerCase().includes(query.toLowerCase())
      )
    )
    .sort((a, b) => b.proofScore - a.proofScore);

  const getVideoThumbnail = (url) => {
    if (!url) return "";
    return url.replace("/video/upload/", "/video/upload/so_0,f_jpg/");
  };

  return (
    <>
      <h1 className="title">Search Projects</h1>

      <input
        className="search-bar enhanced"
        placeholder="Search by title or tech stack..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid">
        {filtered.map((project) => (
          <div
            key={project._id}
            className="card enhanced-card"
            onClick={() =>
              navigate(`/company/project/${project._id}`)
            }
            style={{ cursor: "pointer" }}
          >
            {project.videoLink && (
              <img
                src={getVideoThumbnail(project.videoLink)}
                alt="preview"
                className="video-thumbnail"
              />
            )}

            {/* Interested text */}
            {project.shortlistCount > 0 && (
              <div className="interested-text">
                {project.shortlistCount === 1
                  ? "1 company interested"
                  : `${project.shortlistCount} companies interested`}
              </div>
            )}

            <h3>{project.title}</h3>

            <p style={{ color: "#666" }}>
              Built by {project.student?.name}
            </p>

            {/* 🔥 PROOF SCORE DISPLAY */}
            <p
              style={{
                fontWeight: "600",
                marginTop: "10px",
                color:
                  project.proofScore >= 75
                    ? "#16a34a"
                    : project.proofScore >= 50
                    ? "#f59e0b"
                    : "#dc2626"
              }}
            >
              Proof Score: {project.proofScore}/100
            </p>
          </div>
        ))}
      </div>
    </>
  );
}