import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyProjects } from "../services/api";
import { getScoreColor } from "../hooks/utils";
import ProgressBar from "../components/ProgressBar";

export default function ProjectPreview({ token }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyProjects()
            .then(projects => {
                const found = projects.find(p => p._id === id);
                setProject(found || null);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div style={{ padding: 40, color: "var(--text-muted)" }}>Loading…</div>;

    if (!project) return (
        <div style={{ padding: 40 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/student")}>← Dashboard</button>
            <div className="empty-state" style={{ marginTop: 40 }}>
                <div className="empty-state-icon">❌</div>
                <h3>Project not found</h3>
            </div>
        </div>
    );

    const scoreColor = getScoreColor(project.proofScore);

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 40 }}>
            <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate("/student")}>
                ← Back to Dashboard
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>{project.title}</h1>
                {project.isVerified && (
                    <span className="verified-badge" style={{ position: "static" }}>✓ Verified</span>
                )}
            </div>

            {project.videoLink && (
                <video
                    controls
                    src={project.videoLink}
                    style={{ width: "100%", borderRadius: 14, marginBottom: 24, maxHeight: 460, background: "#000" }}
                />
            )}

            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontWeight: 700 }}>Proof Score</span>
                    <strong style={{ fontSize: 22, color: scoreColor }}>{project.proofScore}/100</strong>
                </div>
                <ProgressBar value={project.proofScore} height={8} />

                {project.proofBreakdown && (
                    <div style={{ marginTop: 16 }}>
                        {[
                            { label: "GitHub Depth", score: project.proofBreakdown.githubDepth, max: 25 },
                            { label: "Commit Consistency", score: project.proofBreakdown.commitConsistency, max: 20 },
                            { label: "Repo Structure", score: project.proofBreakdown.repoStructure, max: 20 },
                            { label: "Demo Integrity", score: project.proofBreakdown.demoIntegrity, max: 15 },
                            { label: "Technical Explanation", score: project.proofBreakdown.technicalExplanation, max: 20 }
                        ].map(item => (
                            <div key={item.label} className="breakdown-row">
                                <span className="breakdown-label">{item.label}</span>
                                <div className="breakdown-bar">
                                    <div
                                        className="breakdown-fill"
                                        style={{ width: `${(item.score / item.max) * 100}%` }}
                                    />
                                </div>
                                <span className="breakdown-score">{item.score}/{item.max}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-secondary)", marginBottom: 14 }}>
                    {project.description}
                </p>
                <div className="tags">
                    {project.techStack?.map((t, i) => <span key={i} className="tag">{t}</span>)}
                </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
                {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                        💻 GitHub
                    </a>
                )}
                {project.demoLink && (
                    <a href={project.demoLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                        🚀 Live Demo
                    </a>
                )}
            </div>
        </div>
    );
}