import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/dashboard.css";

export default function ProjectPreview({ token }) {
    const { id } = useParams();
    const [project, setProject] = useState(null);

    useEffect(() => {
        fetchProject();
    }, []);

    const fetchProject = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/projects/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProject(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (!project) return <p>Loading...</p>;

    const score = project.proofScore || 0;

    const confidence =
        score >= 75
            ? { text: "High", color: "#16a34a" }
            : score >= 50
                ? { text: "Medium", color: "#f59e0b" }
                : { text: "Low", color: "#dc2626" };

    const breakdown = project.proofBreakdown || {};

    return (
        <div className="preview-page">

            {/* 🎥 VIDEO */}
            {project.videoLink && (
                <div className="video-wrapper">
                    <video
                        controls
                        src={project.videoLink}
                        className="preview-video"
                    />
                </div>
            )}

            <h1>
                {project.title}
                {project.isVerified && (
                    <div style={{
                        background: "#16a34a",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        display: "inline-block",
                        marginTop: "10px"
                    }}>
                        ✔ Verified Project
                    </div>
                )}
            </h1>

            {/* 🏆 PROOF SCORE */}
            <div style={{ marginTop: "20px" }}>
                <h3>Proof Score: {score}/100</h3>
                <p style={{ color: confidence.color, fontWeight: "600" }}>
                    Confidence: {confidence.text}
                </p>
            </div>

            {/* 📊 PROOF ENGINE BREAKDOWN */}
            <div style={{ marginTop: "30px" }}>
                <h2>Proof Engine Evaluation</h2>

                {[
                    { label: "GitHub Depth", value: breakdown.githubDepth || 0, max: 25 },
                    { label: "Commit Consistency", value: breakdown.commitConsistency || 0, max: 20 },
                    { label: "Repository Structure", value: breakdown.repoStructure || 0, max: 20 },
                    { label: "Demo Integrity", value: breakdown.demoIntegrity || 0, max: 15 },
                    { label: "Technical Explanation", value: breakdown.technicalExplanation || 0, max: 20 },
                ].map((item, index) => (
                    <div key={index} style={{ marginBottom: "18px" }}>
                        <div className="auth-row">
                            <span>{item.label}</span>
                            <span>{item.value}/{item.max}</span>
                        </div>

                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${(item.value / item.max) * 100}%`,
                                    background:
                                        item.value >= item.max * 0.7
                                            ? "#16a34a"
                                            : item.value >= item.max * 0.4
                                                ? "#f59e0b"
                                                : "#dc2626"
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* DESCRIPTION */}
            <p style={{ marginTop: "25px" }}>
                {project.description}
            </p>

            {/* TECH STACK */}
            <div className="tags" style={{ marginTop: "15px" }}>
                {project.techStack.map((tech, index) => (
                    <span key={index} className="tag">
                        {tech}
                    </span>
                ))}
            </div>

            {/* DEMO BUTTON */}
            {project.demoLink && (
                <a href={project.demoLink} target="_blank" rel="noreferrer">
                    <button className="primary-btn" style={{ marginTop: "20px" }}>
                        🚀 View Live Demo
                    </button>
                </a>
            )}
        </div>
    );
}