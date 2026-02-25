import { useEffect, useState } from "react";
import axios from "axios";

export default function CompanyShortlisted({ token }) {
  const [shortlisted, setShortlisted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShortlisted();
  }, []);

  const fetchShortlisted = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/shortlist",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShortlisted(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <h1 className="title">Shortlisted Projects</h1>

      {loading && <p>Loading shortlisted projects...</p>}

      {!loading && shortlisted.length === 0 && (
        <p>No shortlisted projects yet.</p>
      )}

      <div className="grid">
        {shortlisted.map((item) => {
          const project = item.project;

          if (!project) return null;

          return (
            <div key={project._id} className="card enhanced-card">
              <h3>{project.title}</h3>

              <p style={{ color: "#666" }}>
                Built by {project.student?.name}
              </p>

              <div className="tags">
                {project.techStack.map((tech, index) => (
                  <span key={index} className="tag">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="score-row">
                <span>Authenticity</span>
                <span>{project.authenticityScore}%</span>
              </div>

              <div className="progress">
                <div
                  className="progress-fill"
                  style={{ width: `${project.authenticityScore}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}