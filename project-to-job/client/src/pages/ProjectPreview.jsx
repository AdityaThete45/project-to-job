import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

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

            <h1>{project.title}</h1>

            {/* 🏆 PROOF SCORE */}
            <div style={{ marginTop: "20px" }}>
                <h3>Proof Score: {project.proofScore}/100</h3>

                {project.proofScore >= 75 && (
                    <p style={{ color: "green", fontWeight: "600" }}>
                        Confidence: High
                    </p>
                )}

                {project.proofScore >= 50 && project.proofScore < 75 && (
                    <p style={{ color: "orange", fontWeight: "600" }}>
                        Confidence: Medium
                    </p>
                )}

                {project.proofScore < 50 && (
                    <p style={{ color: "red", fontWeight: "600" }}>
                        Confidence: Low
                    </p>
                )}
            </div>

            {/* 📊 BREAKDOWN */}
            <div style={{ marginTop: "15px" }}>
                <p>Code Strength: {project.proofBreakdown?.codeStrength}/30</p>
                <p>Execution Proof: {project.proofBreakdown?.executionProof}/20</p>
                <p>Technical Depth: {project.proofBreakdown?.technicalDepth}/20</p>
                <p>Explanation Quality: {project.proofBreakdown?.explanationQuality}/15</p>
                <p>Project Maturity: {project.proofBreakdown?.projectMaturity}/15</p>
            </div>

            {/* DESCRIPTION */}
            <p style={{ marginTop: "20px" }}>
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
                    <button className="primary-btn">
                        🚀 View Live Demo
                    </button>
                </a>
            )}
        </div>
    );
}