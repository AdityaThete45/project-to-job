import { useState } from "react";
import "../styles/dashboard.css";

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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      alert("Please upload project explanation video.");
      return;
    }

    if (!form.githubLink.trim()) {
      alert("GitHub link is required.");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("title", form.title.trim());
    formData.append("githubLink", form.githubLink.trim());
    formData.append("demoLink", form.demoLink.trim());
    formData.append("role", form.role.trim());
    formData.append("description", form.description.trim());

    const techArray = form.techStack
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    formData.append("techStack", JSON.stringify(techArray));

    formData.append("video", videoFile);

    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to upload project.");
        setLoading(false);
        return;
      }

      alert("Project added successfully!");

      onProjectAdded();

      setForm({
        title: "",
        githubLink: "",
        demoLink: "",
        techStack: "",
        role: "",
        description: ""
      });

      setVideoFile(null);

    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="form-card">
      <h2>Upload Project</h2>
      <p className="subtitle">
        Showcase your work to potential employers.
      </p>

      <form onSubmit={handleSubmit} className="project-form">

        <label>Project Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label>GitHub Link *</label>
        <input
          name="githubLink"
          value={form.githubLink}
          onChange={handleChange}
          required
        />

        <label>Live Demo Link</label>
        <input
          name="demoLink"
          value={form.demoLink}
          onChange={handleChange}
        />

        <label>Upload Explanation Video (Required)</label>
        <input
          type="file"
          accept="video/mp4,video/*"
          required
          onChange={(e) => setVideoFile(e.target.files[0])}
        />

        <label>Tech Stack (comma separated)</label>
        <input
          name="techStack"
          value={form.techStack}
          onChange={handleChange}
          placeholder="React, Node, MongoDB"
        />

        <label>Your Role</label>
        <input
          name="role"
          value={form.role}
          onChange={handleChange}
        />

        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="4"
        />

        <button
          type="submit"
          className="primary-btn"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Submit Project"}
        </button>

      </form>
    </div>
  );
}