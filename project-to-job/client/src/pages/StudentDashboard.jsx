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
  const [active, setActive] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const proj = await getMyProjects(token);
      const ints = await getMyInterviews(token);

      const sl = await axios.get(
        "http://localhost:5000/api/shortlist/student",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProjects(proj || []);
      setInterviews(ints || []);
      setShortlists(sl.data || []);
    } catch (err) {
      console.error(err);
    }
  };

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

  const pending = interviews.filter((i) => i.status === "pending").length;

  // ✅ Avg Proof Score (Phase 2.0)
  const avg =
    projects.length > 0
      ? Math.round(
          projects.reduce((a, b) => a + (b.proofScore || 0), 0) /
            projects.length
        )
      : 0;

  // 🔥 Interest Map
  const interestMap = {};
  shortlists.forEach((s) => {
    const id = s.project?._id;
    if (!id) return;
    if (!interestMap[id]) interestMap[id] = 0;
    interestMap[id]++;
  });

  // ================= PROJECT PREVIEW MODE =================
  if (selectedProject) {
    const interestedCompanies = shortlists.filter(
      (item) => item.project?._id === selectedProject._id
    );

    const interestCount = interestMap[selectedProject._id] || 0;

    return (
      <div className="dashboard">
        <Sidebar
          menuItems={[
            { key: "dashboard", label: "Dashboard" },
            { key: "projects", label: "My Projects" },
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

          <h1 style={{ marginTop: "15px" }}>
            {selectedProject.title}
            <span className="interest-badge">
              {interestCount} Interested
            </span>
          </h1>

          {selectedProject.videoLink && (
            <div className="video-wrapper">
              <video
                controls
                src={selectedProject.videoLink}
                className="preview-video"
              />
            </div>
          )}

          <p style={{ marginTop: "15px" }}>
            {selectedProject.description}
          </p>

          <div className="tags">
            {selectedProject.techStack?.map((tech, index) => (
              <span key={index} className="tag">
                {tech}
              </span>
            ))}
          </div>

          {/* 🔥 Proof Score Section */}
          {/* 🏆 PROOF ENGINE 3.0 */}
<div style={{ marginTop: "25px" }}>
  <h2>Proof Engine 3.0 Evaluation</h2>

  <h3 style={{ marginTop: "10px" }}>
    Final Proof Score: {selectedProject.proofScore}/100
  </h3>

  <div
    style={{
      marginTop: "10px",
      height: "10px",
      background: "#eee",
      borderRadius: "6px",
      overflow: "hidden"
    }}
  >
    <div
      style={{
        width: `${selectedProject.proofScore}%`,
        height: "100%",
        background:
          selectedProject.proofScore >= 75
            ? "#16a34a"
            : selectedProject.proofScore >= 50
            ? "#f59e0b"
            : "#dc2626"
      }}
    />
  </div>

  <div style={{ marginTop: "20px", lineHeight: "1.8" }}>
    <p>
      GitHub Depth Analysis:{" "}
      {selectedProject.proofBreakdown?.githubDepth || 0}/25
    </p>
    <p>
      Commit Consistency Signal:{" "}
      {selectedProject.proofBreakdown?.commitConsistency || 0}/20
    </p>
    <p>
      Repository Structure Quality:{" "}
      {selectedProject.proofBreakdown?.repoStructure || 0}/20
    </p>
    <p>
      Demo Integrity Check:{" "}
      {selectedProject.proofBreakdown?.demoIntegrity || 0}/15
    </p>
    <p>
      Technical Explanation Strength:{" "}
      {selectedProject.proofBreakdown?.technicalExplanation || 0}/20
    </p>
  </div>
</div>
          <div style={{ marginTop: "30px" }}>
            <h3>Companies Interested</h3>

            {interestedCompanies.length === 0 ? (
              <p style={{ color: "#888" }}>
                No companies have shortlisted this project yet.
              </p>
            ) : (
              interestedCompanies.map((item) => (
                <div key={item._id} className="interview-card">
                  <strong>{item.company?.name}</strong>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    {" "}
                    • {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= NORMAL DASHBOARD MODE =================
  return (
    <div className="dashboard">
      <Sidebar
        menuItems={[
          { key: "dashboard", label: "Dashboard" },
          { key: "projects", label: "My Projects" },
          { key: "interviews", label: "Interview Requests" },
          { key: "shortlists", label: "Shortlisted By Companies" },
          { key: "profile", label: "Profile" },
        ]}
        active={active}
        setActive={setActive}
        onLogout={onLogout}
      />

      <div className="main">
        {active === "dashboard" && (
          <>
            <h1>Welcome back</h1>

            <div className="stats">
              <StatCard type="projects" value={projects.length} label="Projects" />
              <StatCard type="interviews" value={pending} label="Pending Interviews" />
              <StatCard type="proof" value={`${avg}/100`} label="Avg Proof Score" />
              <StatCard type="shortlist" value={shortlists.length} label="Times Shortlisted" />
            </div>

            <div className="grid">
              {projects.map((p) => (
                <ProjectCard
                  key={p._id}
                  project={p}
                  interestCount={interestMap[p._id] || 0}
                  onClick={(project) => setSelectedProject(project)}
                />
              ))}
            </div>
          </>
        )}

        {active === "projects" && (
          <>
            <button
              className="primary-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Close" : "Add Project"}
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
                  onClick={(project) => setSelectedProject(project)}
                />
              ))}
            </div>
          </>
        )}

        {active === "interviews" && (
          <>
            {interviews.map((i) => (
              <div key={i._id} className="interview-card">
                <strong>{i.company?.name}</strong>
                <p>{i.project?.title}</p>

                {i.status === "pending" ? (
                  <>
                    <button
                      className="primary-btn"
                      onClick={() => handleInterviewUpdate(i._id, "accepted")}
                    >
                      Accept
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => handleInterviewUpdate(i._id, "rejected")}
                    >
                      Decline
                    </button>
                  </>
                ) : (
                  <span className={`status ${i.status}`}>
                    {i.status}
                  </span>
                )}
              </div>
            ))}
          </>
        )}

        {active === "shortlists" && (
          <>
            {shortlists.map((item) => (
              <div key={item._id} className="interview-card">
                <strong>{item.company?.name}</strong>
                <p>{item.project?.title}</p>
              </div>
            ))}
          </>
        )}

        {active === "profile" && (
          <div className="grid">
            {projects.map((p) => (
              <ProjectCard
                key={p._id}
                project={p}
                interestCount={interestMap[p._id] || 0}
                onClick={(project) => setSelectedProject(project)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}