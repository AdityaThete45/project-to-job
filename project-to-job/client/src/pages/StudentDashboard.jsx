import { useEffect, useState } from "react";
import { getMyProjects, getMyInterviews } from "../services/api";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";
import AddProject from "./AddProject";
import "../styles/dashboard.css";

export default function StudentDashboard({ token, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [shortlists, setShortlists] = useState([]);
  const [trust, setTrust] = useState(null);

  const [active, setActive] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  /* ================= GET USER ID FROM TOKEN ================= */
  const getUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const userId = getUserIdFromToken(token);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const proj = await getMyProjects(token);
      const ints = await getMyInterviews(token);

      const sl = await axios.get(
        "http://localhost:5000/api/shortlist/student",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const trustRes = await axios.get(
        `http://localhost:5000/api/users/${userId}/trust`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProjects(proj || []);
      setInterviews(ints || []);
      setShortlists(sl.data || []);
      setTrust(trustRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= INTERVIEW UPDATE ================= */
  const handleInterviewUpdate = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/interviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= DERIVED DATA ================= */

  const pending = interviews.filter(
    (i) => i.status === "pending"
  ).length;

  const interestMap = {};
  shortlists.forEach((s) => {
    const id = s.project?._id;
    if (!id) return;
    interestMap[id] = (interestMap[id] || 0) + 1;
  });

  /* =====================================================
     🔥 PROJECT PREVIEW MODE
  ===================================================== */

  if (selectedProject) {
    const interestCount =
      interestMap[selectedProject._id] || 0;

    return (
      <div className="dashboard">
        <Sidebar
          menuItems={[
            { key: "dashboard", label: "Dashboard" },
            { key: "projects", label: "Add Projects" },
            { key: "interviews", label: "Interview Requests" },
            { key: "shortlists", label: "Shortlisted By Companies" },
            { key: "profile", label: "Profile" },
          ]}
          active={active}
          setActive={setActive}
          onLogout={onLogout}
        />

        <div className="main">
          <button
            className="secondary-btn"
            onClick={() => setSelectedProject(null)}
          >
            ← Back
          </button>

          <h1 style={{ marginTop: "20px" }}>
            {selectedProject.title}
            {selectedProject.isVerified && (
              <span
                style={{
                  marginLeft: "10px",
                  background: "#16a34a",
                  color: "#fff",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                }}
              >
                ✔ Verified
              </span>
            )}
          </h1>

          {interestCount > 0 && (
            <p style={{ marginTop: "10px", fontWeight: "600" }}>
              {interestCount === 1
                ? "1 Company Interested"
                : `${interestCount} Companies Interested`}
            </p>
          )}

          {selectedProject.videoLink && (
            <div style={{ marginTop: "20px" }}>
              <video
                controls
                src={selectedProject.videoLink}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                }}
              />
            </div>
          )}

          <p style={{ marginTop: "20px" }}>
            {selectedProject.description}
          </p>

          <div className="tags">
            {selectedProject.techStack?.map(
              (tech, index) => (
                <span key={index} className="tag">
                  {tech}
                </span>
              )
            )}
          </div>

          <div style={{ marginTop: "25px" }}>
            <h3>
              Proof Score: {selectedProject.proofScore}/100
            </h3>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     🔥 NORMAL DASHBOARD MODE
  ===================================================== */

  return (
    <div className="dashboard">
      <Sidebar
        menuItems={[
          { key: "dashboard", label: "Dashboard" },
          { key: "projects", label: "Add Projects" },
          { key: "interviews", label: "Interview Requests" },
          { key: "shortlists", label: "Shortlisted By Companies" },
          { key: "profile", label: "Profile" },
        ]}
        active={active}
        setActive={setActive}
        onLogout={onLogout}
      />

      <div className="main">

        {/* ================= DASHBOARD ================= */}
        {active === "dashboard" && (
          <>
            <h1>Welcome back</h1>

            <div className="stats">
              <StatCard
                type="projects"
                value={trust?.totalProjects || 0}
                label="Projects"
              />
              <StatCard
                type="interviews"
                value={pending}
                label="Pending Interviews"
              />
              <StatCard
                type="proof"
                value={`${trust?.avgProofScore || 0}/100`}
                label="Avg Proof Score"
              />
              <StatCard
                type="shortlist"
                value={trust?.totalShortlists || 0}
                label="Times Shortlisted"
              />
            </div>

            <div className="grid">
              {projects.map((p) => (
                <ProjectCard
                  key={p._id}
                  project={p}
                  interestCount={interestMap[p._id] || 0}
                  onClick={(project) =>
                    setSelectedProject(project)
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* ================= PROJECTS ================= */}
        {active === "projects" && (
          <>
            <button
              className="primary-btn"
              onClick={() =>
                setShowForm(!showForm)
              }
            >
              {showForm
                ? "Close"
                : "Add Project"}
            </button>

            {showForm && (
              <AddProject
                token={token}
                onProjectAdded={() => {
                  fetchData();
                  setShowForm(false);
                }}
              />
            )}

            <div className="grid">
              {projects.map((p) => (
                <ProjectCard
                  key={p._id}
                  project={p}
                  interestCount={interestMap[p._id] || 0}
                  onClick={(project) =>
                    setSelectedProject(project)
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* ================= INTERVIEWS ================= */}
        {active === "interviews" && (
          <>
            <h2>Interview Requests</h2>

            {interviews.length === 0 && (
              <p>No interviews yet.</p>
            )}

            {interviews.map((i) => (
              <div
                key={i._id}
                className="interview-card enhanced-card"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <strong>
                    {i.company?.name}
                  </strong>

                  <span
                    style={{
                      fontWeight: "600",
                      color:
                        i.status ===
                        "accepted"
                          ? "#16a34a"
                          : i.status ===
                            "rejected"
                          ? "#dc2626"
                          : "#f59e0b",
                    }}
                  >
                    {i.status}
                  </span>
                </div>

                <p>
                  Project:{" "}
                  {i.project?.title}
                </p>

                {i.status ===
                  "pending" && (
                  <div
                    style={{
                      marginTop:
                        "10px",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <button
                      className="primary-btn"
                      onClick={() =>
                        handleInterviewUpdate(
                          i._id,
                          "accepted"
                        )
                      }
                    >
                      Accept
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() =>
                        handleInterviewUpdate(
                          i._id,
                          "rejected"
                        )
                      }
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ================= SHORTLISTS ================= */}
        {active === "shortlists" && (
          <>
            <h2>
              Shortlisted By Companies
            </h2>

            {shortlists.length === 0 && (
              <p>
                No shortlists yet.
              </p>
            )}

            {shortlists.map((s) => (
              <div
                key={s._id}
                className="interview-card"
              >
                <strong>
                  {s.company?.name}
                </strong>
                <p>
                  Project:{" "}
                  {s.project?.title}
                </p>
              </div>
            ))}
          </>
        )}

        {/* ================= PROFILE ================= */}
        {active === "profile" && (
          <>
            <h2>My Profile</h2>
            <p>
              Total Projects:{" "}
              {trust?.totalProjects}
            </p>
            <p>
              Verified Projects:{" "}
              {trust?.verifiedProjects}
            </p>
            <p>
              Acceptance Rate:{" "}
              {trust?.acceptanceRate}%
            </p>
          </>
        )}

      </div>
    </div>
  );
}