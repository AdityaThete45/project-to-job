import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProjectDetail({ token }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shortlisted, setShortlisted] = useState(false);
    const [interviewRequested, setInterviewRequested] = useState(false);

    useEffect(() => {
        fetchProject();
        fetchActionStatus();
    }, []);

    // ================= FETCH PROJECT =================
    const fetchProject = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/projects/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProject(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ================= FETCH STATUS =================
    const fetchActionStatus = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/projects/${id}/status`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setShortlisted(res.data.shortlisted);
            setInterviewRequested(res.data.interviewRequested);
        } catch (err) {
            console.error("Status fetch error:", err);
        }
    };

    // ================= SHORTLIST =================
    const shortlistStudent = async () => {
        try {
            await axios.post(
                "http://localhost:5000/api/shortlist",
                {
                    studentId: project.student._id,
                    projectId: project._id
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchActionStatus();
        } catch (err) {
            fetchActionStatus();
        }
    };

    // ================= INTERVIEW =================
    const sendInterviewRequest = async () => {
        try {
            await axios.post(
                "http://localhost:5000/api/interviews",
                {
                    studentId: project.student._id,
                    projectId: project._id,
                    message: "We are interested in your project."
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchActionStatus();
        } catch (err) {
            fetchActionStatus();
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!project) return <p>Project not found</p>;

    return (
        <div className="project-detail">

            {/* 🔙 Back Button */}
            <div style={{ marginBottom: "25px" }}>
                <button
                    onClick={() => navigate("/company/search")}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        background: "#fff",
                        cursor: "pointer"
                    }}
                >
                    ← Back to Search
                </button>
            </div>

            <h1>{project.title}</h1>
            <p style={{ color: "#666" }}>
                Built by {project.student?.name}

                {/* 🎓 STUDENT PROFILE SIGNAL */}
                <div
                    style={{
                        marginTop: "15px",
                        padding: "15px",
                        background: "#f9fafb",
                        borderRadius: "10px"
                    }}
                >
                    <h3>Student Profile</h3>

                    <p><strong>Name:</strong> {project.student?.name}</p>
                    <p><strong>College:</strong> {project.student?.college || "Not provided"}</p>
                    <p><strong>CGPA:</strong> {project.student?.cgpa || "Not provided"}</p>
                    <p><strong>Graduation Year:</strong> {project.student?.graduationYear || "Not provided"}</p>

                    <div style={{ marginTop: "10px" }}>
                        <strong>Skills:</strong>
                        <div className="tags" style={{ marginTop: "5px" }}>
                            {project.student?.skills?.map((skill, index) => (
                                <span key={index} className="tag">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </p>

            {/* 🎥 VIDEO */}
            {project.videoLink && (
                <video
                    controls
                    width="100%"
                    style={{
                        borderRadius: "12px",
                        marginTop: "20px",
                        marginBottom: "20px"
                    }}
                >
                    <source src={project.videoLink} type="video/mp4" />
                </video>
            )}

            {/* 🏆 PROOF SCORE 2.0 */}
            {/* 🏆 PROOF ENGINE 3.0 */}
            <div style={{ marginTop: "30px" }}>
                <h2>Proof Engine 3.0</h2>

                <h3 style={{ marginTop: "10px" }}>
                    Final Proof Score: {project.proofScore}/100
                </h3>

                <div
                    style={{
                        marginTop: "10px",
                        height: "12px",
                        background: "#eee",
                        borderRadius: "6px",
                        overflow: "hidden"
                    }}
                >
                    <div
                        style={{
                            width: `${project.proofScore}%`,
                            height: "100%",
                            background:
                                project.proofScore >= 75
                                    ? "#16a34a"
                                    : project.proofScore >= 50
                                        ? "#f59e0b"
                                        : "#dc2626"
                        }}
                    />
                </div>

                <div style={{ marginTop: "20px", lineHeight: "1.8" }}>
                    <p>GitHub Depth Analysis: {project.proofBreakdown?.githubDepth}/25</p>
                    <p>Commit Consistency Signal: {project.proofBreakdown?.commitConsistency}/20</p>
                    <p>Repository Structure Quality: {project.proofBreakdown?.repoStructure}/20</p>
                    <p>Demo Integrity Check: {project.proofBreakdown?.demoIntegrity}/15</p>
                    <p>Technical Explanation Strength: {project.proofBreakdown?.technicalExplanation}/20</p>
                </div>
            </div>

            {/* 📊 BREAKDOWN */}


            {/* 🛠 TECH STACK */}
            <div className="tags" style={{ marginTop: "20px" }}>
                {project.techStack.map((tech, index) => (
                    <span key={index} className="tag">
                        {tech}
                    </span>
                ))}
            </div>

            {/* 🧠 DESCRIPTION */}
            <p style={{ marginTop: "20px", lineHeight: "1.6" }}>
                {project.description}
            </p>

            {/* 🔘 ACTION BUTTONS */}
            <div
                style={{
                    marginTop: "30px",
                    display: "flex",
                    gap: "15px",
                    flexWrap: "wrap"
                }}
            >
                {project.demoLink && (
                    <a
                        href={project.demoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="primary-btn"
                    >
                        🚀 Live Demo
                    </a>
                )}

                <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-btn"
                >
                    💻 View Code
                </a>

                {shortlisted ? (
                    <button className="secondary-btn" disabled>
                        ⭐ Shortlisted
                    </button>
                ) : (
                    <button
                        className="secondary-btn"
                        onClick={shortlistStudent}
                    >
                        ⭐ Shortlist
                    </button>
                )}

                {interviewRequested ? (
                    <button className="primary-btn" disabled>
                        ✅ Interview Requested
                    </button>
                ) : (
                    <button
                        className="primary-btn"
                        onClick={sendInterviewRequest}
                    >
                        📩 Request Interview
                    </button>
                )}
            </div>
        </div>
    );
}