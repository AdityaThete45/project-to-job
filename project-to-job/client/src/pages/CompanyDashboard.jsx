import { useEffect, useState } from "react";
import axios from "axios";
import { LayoutDashboard, Star, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CompanyDashboard({ token }) {
  const [projects, setProjects] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [shortlistedProjectIds, setShortlistedProjectIds] = useState([]);
  const [requestedStudentIds, setRequestedStudentIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const projectsRes = await axios.get(
        "http://localhost:5000/api/company/search",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const interviewsRes = await axios.get(
        "http://localhost:5000/api/interviews/company",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const shortlistRes = await axios.get(
        "http://localhost:5000/api/shortlist",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🔥 Sort projects by Proof Score
      const sortedProjects =
        (projectsRes.data || []).sort(
          (a, b) => b.proofScore - a.proofScore
        );

      setProjects(sortedProjects);
      setInterviews(interviewsRes.data || []);

      setShortlistedProjectIds(
        shortlistRes.data.map((s) => s.project?._id)
      );

      setRequestedStudentIds(
        interviewsRes.data.map((i) => i.student?._id)
      );

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getVideoThumbnail = (url) => {
    if (!url) return "";
    return url.replace("/video/upload/", "/video/upload/so_0,f_jpg/");
  };

  const sendInterviewRequest = async (project) => {
    try {
      await axios.post(
        "http://localhost:5000/api/interviews",
        {
          studentId: project.student._id,
          projectId: project._id,
          message: "We are interested in your profile."
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchAllData();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const shortlistProject = async (project) => {
    try {
      await axios.post(
        "http://localhost:5000/api/shortlist",
        {
          studentId: project.student._id,
          projectId: project._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchAllData();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <>
      <h1 className="title">Company Dashboard</h1>

      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          {/* ===== STATS ===== */}
          <div className="stats">
            <div className="stat-card">
              <LayoutDashboard size={18} />
              <div>
                <h2>{projects.length}</h2>
                <p>Total Projects</p>
              </div>
            </div>

            <div className="stat-card">
              <Star size={18} />
              <div>
                <h2>{shortlistedProjectIds.length}</h2>
                <p>Shortlisted</p>
              </div>
            </div>

            <div className="stat-card">
              <CalendarDays size={18} />
              <div>
                <h2>{interviews.length}</h2>
                <p>Interviews</p>
              </div>
            </div>
          </div>

          {/* ===== PROJECT GRID ===== */}
          <div className="grid">
            {projects.map((project) => (
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

                <div
                  style={{ marginTop: 15, display: "flex", gap: 10 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="secondary-btn"
                    disabled={shortlistedProjectIds.includes(project._id)}
                    onClick={() => shortlistProject(project)}
                  >
                    {shortlistedProjectIds.includes(project._id)
                      ? "Shortlisted"
                      : "Shortlist"}
                  </button>

                  <button
                    className="primary-btn"
                    disabled={requestedStudentIds.includes(project.student?._id)}
                    onClick={() => sendInterviewRequest(project)}
                  >
                    {requestedStudentIds.includes(project.student?._id)
                      ? "Requested"
                      : "Request Interview"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}