import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",

    // Student
    college: "",
    branch: "",
    cgpa: "",
    graduationYear: "",
    skills: "",
    githubUsername: "",

    // Company
    companyName: "",
    industry: "",
    companySize: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRoleChange = (role) => {
    setForm({ ...form, role });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formattedData = {
      ...form,
      skills: form.skills
        ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      cgpa: form.cgpa ? Number(form.cgpa) : null,
      graduationYear: form.graduationYear
        ? Number(form.graduationYear)
        : null,
    };

    try {
      const data = await registerUser(formattedData);

      if (data.success) {
        alert("Account created successfully!");
        navigate("/login");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError(err.message || "Error during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div 
        className={`auth-card transition-all duration-300 w-full ${
          form.role === "student" ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="auth-logo flex flex-col items-center">
          <img 
            src="/p2j_logo.png" 
            alt="P2J Logo" 
            className="w-14 h-14 object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 mb-4" 
          />
          <h2 className="auth-title">Create Your Account</h2>
          <p className="auth-subtitle">Join Project-to-Job today</p>
        </div>

        {error && (
          <div 
            style={{ 
              background: "#fee2e2", 
              color: "#dc2626", 
              padding: "10px 14px", 
              borderRadius: "var(--radius)", 
              fontSize: 14, 
              marginBottom: 20 
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* ===== ROLE TOGGLE ===== */}
          <div className="form-group">
            <label className="form-label">Are you registering as a Student or Recruiter?</label>
            <div className="role-toggle mt-1">
              <button
                type="button"
                className={`role-btn ${form.role === "student" ? "active" : ""}`}
                onClick={() => handleRoleChange("student")}
              >
                Student
              </button>
              <button
                type="button"
                className={`role-btn ${form.role === "company" ? "active" : ""}`}
                onClick={() => handleRoleChange("company")}
              >
                Recruiter / Company
              </button>
            </div>
          </div>

          {/* ===== CORE CREDENTIALS ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="form-group col-span-1 md:col-span-2">
              <label className="form-label">
                {form.role === "company" ? "Recruiter Name" : "Full Name"}
              </label>
              <input
                className="form-input"
                name="name"
                placeholder={form.role === "company" ? "Jane Smith" : "John Doe"}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                name="email"
                type="email"
                placeholder="you@example.com"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="••••••••"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* ===== STUDENT EXTRA FIELDS ===== */}
          {form.role === "student" && (
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">Academic & Github Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">GitHub Username</label>
                  <input
                    className="form-input border-indigo-200 focus:border-indigo-500"
                    name="githubUsername"
                    placeholder="e.g. octocat (Required)"
                    onChange={handleChange}
                    required
                  />
                  <span className="text-[11px] text-[var(--text-muted)] mt-1">
                    * Used to verify commit history and code authenticity.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">College Name</label>
                  <input
                    className="form-input"
                    name="college"
                    placeholder="e.g. Stanford University"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Branch / Major</label>
                  <input
                    className="form-input"
                    name="branch"
                    placeholder="e.g. Computer Science"
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="form-group">
                    <label className="form-label">CGPA</label>
                    <input
                      className="form-input"
                      name="cgpa"
                      type="number"
                      step="0.01"
                      placeholder="9.5"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Grad Year</label>
                    <input
                      className="form-input"
                      name="graduationYear"
                      type="number"
                      placeholder="2026"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group col-span-1 md:col-span-2">
                  <label className="form-label">Skills</label>
                  <input
                    className="form-input"
                    name="skills"
                    placeholder="React, Node.js, Python (comma separated)"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===== COMPANY EXTRA FIELDS ===== */}
          {form.role === "company" && (
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">Company Details</h3>
              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    className="form-input"
                    name="companyName"
                    placeholder="e.g. Acme Corp"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <input
                      className="form-input"
                      name="industry"
                      placeholder="e.g. Software SaaS"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Size</label>
                    <input
                      className="form-input"
                      name="companySize"
                      placeholder="e.g. 50-100"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-full mt-4" 
            disabled={loading}
          >
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-footer mt-4">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}