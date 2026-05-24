import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, getProjectActionStatus, addToShortlist, sendInterviewRequest, removeFromShortlist } from "../services/api";
import { getScoreColor, getTrustRankStyle, formatDate } from "../hooks/utils";
import ProgressBar from "../components/ProgressBar";
import { ArrowLeft, Github, Globe, Star, MessageSquare, CheckCircle, GitCommit, GitBranch, Calendar, Eye } from "lucide-react";

export default function ProjectDetail({ token }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [status, setStatus] = useState({ shortlisted: false, interviewRequested: false });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAll();
    }, [id]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [proj, stat] = await Promise.all([
                getProjectById(id),
                getProjectActionStatus(id)
            ]);
            setProject(proj);
            setStatus(stat);
        } catch (err) {
            setError("Project not found.");
        } finally {
            setLoading(false);
        }
    };

    const handleShortlist = async () => {
        setActionLoading(prev => ({ ...prev, shortlist: true }));
        try {
            if (status.shortlisted) {
                await removeFromShortlist(project._id);
                setStatus(s => ({ ...s, shortlisted: false }));
            } else {
                await addToShortlist({ studentId: project.student._id, projectId: project._id });
                setStatus(s => ({ ...s, shortlisted: true }));
            }
        } catch (err) {
            setStatus(s => ({ ...s, shortlisted: !s.shortlisted }));
        } finally {
            setActionLoading(prev => ({ ...prev, shortlist: false }));
        }
    };

    const handleInterview = async () => {
        setActionLoading(prev => ({ ...prev, interview: true }));
        try {
            await sendInterviewRequest({
                studentId: project.student._id,
                projectId: project._id,
                message: "We reviewed your project and are impressed. We'd love to discuss a potential opportunity."
            });
            setStatus(s => ({ ...s, interviewRequested: true }));
        } catch (err) {
            setStatus(s => ({ ...s, interviewRequested: true }));
        } finally {
            setActionLoading(prev => ({ ...prev, interview: false }));
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 40 }}>
                <div className="skeleton" style={{ height: 24, width: 120, marginBottom: 24 }} />
                <div className="skeleton" style={{ height: 36, width: "60%", marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 400, borderRadius: 12, marginBottom: 24 }} />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div style={{ padding: 40 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
                <div className="empty-state" style={{ marginTop: 40 }}>
                    <div className="empty-state-icon">❌</div>
                    <h3>{error || "Project not found"}</h3>
                </div>
            </div>
        );
    }

    const scoreColor = getScoreColor(project.proofScore);
    const student = project.student;
    const breakdown = project.proofBreakdown || {};
    const ai = project.aiInsights || {};
    const ghStats = project.githubStats || {};
    const rankStyle = getTrustRankStyle(student?.trustRank);

    const breakdownItems = [
        { label: "GitHub Depth Analysis", score: breakdown.githubDepth || 0, max: 25 },
        { label: "Commit Consistency", score: breakdown.commitConsistency || 0, max: 20 },
        { label: "Repository Structure", score: breakdown.repoStructure || 0, max: 20 },
        { label: "Demo Integrity", score: breakdown.demoIntegrity || 0, max: 15 },
        { label: "Technical Explanation", score: breakdown.technicalExplanation || 0, max: 20 }
    ];

    return (
        <div style={{ maxWidth: 900, padding: "0 4px" }}>
            {/* Back */}
            <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>
                <ArrowLeft size={14} /> Back
            </button>

            {/* Title row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>{project.title}</h1>
                        {project.isVerified && <span className="verified-badge" style={{ position: "static" }}>✓ Verified</span>}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
                        Built by <strong>{student?.name}</strong>
                        {project.companyInterestCount > 0 && (
                            <span style={{ marginLeft: 10, color: "var(--accent)", fontWeight: 600 }}>
                                🔥 {project.companyInterestCount} companies interested
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                            <Github size={14} /> Code
                        </a>
                    )}
                    {project.demoLink && (
                        <a href={project.demoLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                            <Globe size={14} /> Demo
                        </a>
                    )}
                    <button
                        className={`btn btn-sm ${status.shortlisted ? "btn-secondary" : "btn-secondary"}`}
                        onClick={handleShortlist}
                        disabled={actionLoading.shortlist}
                    >
                        <Star size={14} fill={status.shortlisted ? "currentColor" : "none"} />
                        {status.shortlisted ? "Shortlisted" : "Shortlist"}
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleInterview}
                        disabled={status.interviewRequested || actionLoading.interview}
                    >
                        <MessageSquare size={14} />
                        {status.interviewRequested ? "Request Sent ✓" : "Request Interview"}
                    </button>
                </div>
            </div>

            {/* Video */}
            {project.videoLink && (
                <video
                    controls
                    src={project.videoLink}
                    style={{ width: "100%", borderRadius: 14, marginBottom: 24, maxHeight: 480, background: "#000" }}
                />
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
                <div>
                    {/* Description */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Project Description</h3>
                        <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-secondary)" }}>{project.description}</p>
                        <div className="divider" />
                        <div className="tags">
                            {project.techStack?.map((t, i) => <span key={i} className="tag">{t}</span>)}
                        </div>
                        {project.role && (
                            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>
                                <strong>Role:</strong> {project.role}
                            </p>
                        )}
                    </div>

                    {/* Proof Engine */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Proof Engine 3.4</h3>
                            <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor }}>{project.proofScore}/100</div>
                        </div>

                        <ProgressBar value={project.proofScore} height={8} />

                        <div style={{ marginTop: 20 }}>
                            {breakdownItems.map(item => (
                                <div key={item.label} className="breakdown-row">
                                    <span className="breakdown-label">{item.label}</span>
                                    <div className="breakdown-bar">
                                        <div
                                            className="breakdown-fill"
                                            style={{ width: `${(item.score / item.max) * 100}%`, background: getScoreColor((item.score / item.max) * 100) }}
                                        />
                                    </div>
                                    <span className="breakdown-score">{item.score}/{item.max}</span>
                                </div>
                            ))}
                        </div>

                        {/* GitHub Stats */}
                        {(ghStats.totalCommits > 0 || ghStats.repoAgeInDays > 0) && (
                            <>
                                <div className="divider" />
                                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                                    {ghStats.totalCommits > 0 && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                                            <GitCommit size={14} /> {ghStats.totalCommits} commits
                                        </div>
                                    )}
                                    {ghStats.uniqueContributionDays > 0 && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                                            <Calendar size={14} /> {ghStats.uniqueContributionDays} active days
                                        </div>
                                    )}
                                    {ghStats.repoAgeInDays > 0 && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                                            <GitBranch size={14} /> {ghStats.repoAgeInDays} days old
                                        </div>
                                    )}
                                    {ghStats.stars > 0 && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                                            <Star size={14} /> {ghStats.stars} stars
                                        </div>
                                    )}
                                    {project.viewCount > 0 && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                                            <Eye size={14} /> {project.viewCount} views
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* AI Insights */}
                    {(ai.recommendation || ai.commitQuality) && (
                        <div className="insight-box">
                            <h4>🤖 AI Authenticity Insights</h4>
                            {ai.ownershipVerified !== undefined && (
                                <p className="insight-item">
                                    <CheckCircle size={12} style={{ marginRight: 4, color: ai.ownershipVerified ? "var(--success)" : "var(--danger)" }} />
                                    Ownership: {ai.ownershipVerified ? "GitHub username verified" : "Ownership mismatch detected"}
                                </p>
                            )}
                            {ai.commitQuality && <p className="insight-item">📊 {ai.commitQuality}</p>}
                            {ai.repoMaturity && <p className="insight-item">📅 {ai.repoMaturity}</p>}
                            {ai.recommendation && (
                                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginTop: 8 }}>
                                    💡 {ai.recommendation}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Student Sidebar */}
                <div>
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>
                                {student?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>{student?.name}</div>
                                {student?.trustRank && student.trustRank !== "Unranked" && (
                                    <span className="trust-rank-badge" style={{ ...rankStyle, fontSize: 11, marginTop: 2, display: "inline-flex" }}>
                                        🏆 {student.trustRank}
                                    </span>
                                )}
                            </div>
                        </div>

                        {[
                            { label: "College", value: student?.college },
                            { label: "CGPA", value: student?.cgpa },
                            { label: "Graduation", value: student?.graduationYear },
                            { label: "GitHub", value: student?.githubUsername ? `@${student.githubUsername}` : null }
                        ].map(({ label, value }) => value ? (
                            <div key={label} style={{ marginBottom: 8 }}>
                                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
                                <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>{value}</div>
                            </div>
                        ) : null)}

                        {student?.skills?.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Skills</span>
                                <div className="tags" style={{ marginTop: 6 }}>
                                    {student.skills.slice(0, 6).map((s, i) => <span key={i} className="tag">{s}</span>)}
                                </div>
                            </div>
                        )}

                        {student?.trustScore > 0 && (
                            <div style={{ marginTop: 14 }}>
                                <div className="score-row">
                                    <span style={{ fontSize: 13 }}>Trust Score</span>
                                    <strong style={{ color: getScoreColor(student.trustScore) }}>{student.trustScore}/100</strong>
                                </div>
                                <ProgressBar value={student.trustScore} />
                            </div>
                        )}
                    </div>

                    {/* Action Card */}
                    <div className="card">
                        <button
                            className="btn btn-primary btn-full"
                            style={{ marginBottom: 10 }}
                            onClick={handleInterview}
                            disabled={status.interviewRequested || actionLoading.interview}
                        >
                            <MessageSquare size={15} />
                            {status.interviewRequested ? "Interview Requested ✓" : "Request Interview"}
                        </button>
                        <button
                            className="btn btn-secondary btn-full"
                            style={{ marginBottom: 10 }}
                            onClick={handleShortlist}
                            disabled={actionLoading.shortlist}
                        >
                            <Star size={15} fill={status.shortlisted ? "currentColor" : "none"} />
                            {status.shortlisted ? "Remove from Shortlist" : "Add to Shortlist"}
                        </button>
                        {student?._id && (
                            <button
                                className="btn btn-secondary btn-full"
                                onClick={() => navigate(`/company/student/${student._id}`)}
                            >
                                👤 View Full Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}