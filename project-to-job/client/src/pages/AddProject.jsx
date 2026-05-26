import { useState } from "react";
import { Upload, Github, Globe, Code2, FileText, Video } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AddProject({ token, onProjectAdded }) {
  const [form, setForm] = useState({
    title: "",
    githubLink: "",
    demoLink: "",
    techStack: "",
    role: "",
    description: ""
  });
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(""); // upload progress message

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // --- Client-side validation ---
    if (!videoFile) return setError("Project explanation video is required.");
    if (!form.title.trim()) return setError("Project title is required.");
    if (!form.githubLink.trim()) return setError("GitHub link is required.");
    if (!form.description.trim() || form.description.trim().length < 50)
      return setError("Description must be at least 50 characters.");

    const techArray = form.techStack.split(",").map(t => t.trim()).filter(Boolean);
    if (techArray.length === 0) return setError("Add at least one tech stack item.");

    if (videoFile.size > 200 * 1024 * 1024)
      return setError("Video file is too large. Max 200MB.");

    setLoading(true);
    setStep("Uploading video… this may take a minute.");

    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("githubLink", form.githubLink.trim());
      formData.append("demoLink", form.demoLink.trim());
      formData.append("role", form.role.trim());
      formData.append("description", form.description.trim());
      formData.append("techStack", JSON.stringify(techArray));
      formData.append("video", videoFile);

      // Direct fetch — DO NOT set Content-Type (browser sets multipart boundary automatically)
      const authToken = token || localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`
          // NO Content-Type here — let browser set it for FormData
        },
        body: formData
      });

      setStep("Analyzing GitHub & calculating Proof Score…");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed. Please try again.");
      }

      setStep("");
      setLoading(false);

      // Reset form
      setForm({ title: "", githubLink: "", demoLink: "", techStack: "", role: "", description: "" });
      setVideoFile(null);

      // Notify parent — this closes the form and refreshes projects
      onProjectAdded();

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
      setStep("");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full" style={{ marginBottom: 24 }}>
      {/* LEFT COLUMN: Upload Form Card */}
      <div className="card flex-1 w-full" style={{ padding: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Upload Project</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
          Your project will be scored by the Proof Engine using GitHub analysis.
        </p>

        {error && (
          <div style={{
            background: "var(--danger-light)", color: "var(--danger)",
            padding: "10px 14px", borderRadius: "var(--radius)",
            fontSize: 14, marginBottom: 16
          }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              <Code2 size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Project Title *
            </label>
            <input
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. E-commerce Platform with AI Recommendations"
              disabled={loading}
              required
            />
          </div>

          {/* GitHub */}
          <div className="form-group">
            <label className="form-label">
              <Github size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
              GitHub Repository Link *
            </label>
            <input
              className="form-input"
              name="githubLink"
              value={form.githubLink}
              onChange={handleChange}
              placeholder="https://github.com/yourusername/repo-name"
              disabled={loading}
              required
            />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Must be YOUR GitHub username for ownership verification.
            </span>
          </div>

          {/* Demo */}
          <div className="form-group">
            <label className="form-label">
              <Globe size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Live Demo URL (optional)
            </label>
            <input
              className="form-input"
              name="demoLink"
              value={form.demoLink}
              onChange={handleChange}
              placeholder="https://your-project.vercel.app"
              disabled={loading}
            />
          </div>

          {/* Video Upload */}
          <div className="form-group">
            <label className="form-label">
              <Video size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Project Explanation Video *
            </label>
            <div style={{
              border: `2px dashed ${videoFile ? "var(--success)" : "var(--border)"}`,
              borderRadius: "var(--radius)",
              padding: "20px",
              textAlign: "center",
              background: videoFile ? "var(--success-light)" : "var(--bg)",
              transition: "0.15s"
            }}>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                onChange={e => { setVideoFile(e.target.files[0]); setError(""); }}
                style={{ display: "none" }}
                id="video-upload"
                disabled={loading}
              />
              <label htmlFor="video-upload" style={{ cursor: loading ? "not-allowed" : "pointer" }}>
                {videoFile ? (
                  <span style={{ color: "var(--success)", fontWeight: 600, fontSize: 14 }}>
                    ✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                    <span
                      style={{ marginLeft: 10, color: "var(--danger)", fontWeight: 400, fontSize: 12 }}
                      onClick={e => { e.preventDefault(); setVideoFile(null); }}
                    >
                      ✕ Remove
                    </span>
                  </span>
                ) : (
                  <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                    <Upload size={18} style={{ marginRight: 6, verticalAlign: "middle" }} />
                    Click to upload video (mp4 / webm, max 200MB)
                  </span>
                )}
              </label>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="form-group">
            <label className="form-label">Tech Stack * (comma-separated)</label>
            <input
              className="form-input"
              name="techStack"
              value={form.techStack}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB, Express"
              disabled={loading}
            />
          </div>

          {/* Role */}
          <div className="form-group">
            <label className="form-label">Your Role *</label>
            <input
              className="form-input"
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="e.g. Full-Stack Developer / Solo Builder"
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Project Description * (min 50 chars)
            </label>
            <textarea
              className="form-input"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe what it does, the problem it solves, your technical decisions…"
              disabled={loading}
              required
            />
            <span style={{
              fontSize: 12,
              color: form.description.length >= 200 ? "var(--success)" : "var(--text-muted)"
            }}>
              {form.description.length} chars
              {form.description.length >= 200 ? " ✓ Great detail — boosts Proof Score" : " (200+ chars boosts Proof Score)"}
            </span>
          </div>

          {/* Progress */}
          {loading && step && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px",
              background: "var(--accent-light)",
              borderRadius: "var(--radius)",
              marginBottom: 16,
              fontSize: 13,
              color: "var(--accent)"
            }}>
              <span style={{
                display: "inline-block",
                width: 16, height: 16,
                border: "2px solid var(--accent)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                flexShrink: 0
              }} />
              {step}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Uploading & Analyzing…" : "Submit Project"}
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: Submission Guidelines */}
      <div className="card lg:w-[350px] w-full shrink-0" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
          Submission Guidelines
        </h3>
        <img 
          src="/upload_guidelines.png" 
          alt="Upload Guidelines Infographic" 
          style={{ 
            width: "100%", 
            height: "auto", 
            borderRadius: "var(--radius)", 
            marginBottom: 16,
            border: "1px solid var(--border)",
            background: "var(--bg)"
          }} 
        />
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <Github size={14} /> 1. Repository Ownership
            </h4>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
              The repository must be public, and the commits must match your registered GitHub username to pass ownership verification.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <Video size={14} /> 2. Required Demo Video
            </h4>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
              Upload a 2–5 minute video explaining your project. Demonstrate the working features, your repository structure, and explain key design decisions.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <Code2 size={14} /> 3. Project Documentation
            </h4>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
              Provide a rich, detailed description of your technology decisions, database setup, and architecture in the form (200+ characters).
            </p>
          </div>
        </div>

        <div style={{ 
          marginTop: 20, 
          padding: 12, 
          borderRadius: "var(--radius)", 
          background: "var(--accent-light)", 
          border: "1px solid var(--border-light)"
        }}>
          <h5 style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", margin: "0 0 4px 0" }}>
            How Proof Engine Scores:
          </h5>
          <ul style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, paddingLeft: 16, lineHeight: 1.5 }}>
            <li>Commit Consistency (up to 20 pts)</li>
            <li>GitHub Repository Depth (up to 25 pts)</li>
            <li>Folder Structure & Readme (up to 20 pts)</li>
            <li>Video Walkthrough Upload (up to 15 pts)</li>
            <li>Description & Tech Detail (up to 20 pts)</li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}