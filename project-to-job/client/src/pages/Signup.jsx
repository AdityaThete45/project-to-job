import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import "../styles/auth.css";

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

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setForm({ ...form, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
      ...form,
      skills: form.skills
        ? form.skills.split(",").map((s) => s.trim())
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
        alert(data.message || "Signup failed");
      }
    } catch {
      alert("Error during signup");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/image.png" alt="P2J" />
          <h2>Create Your Account</h2>
          <p>Join Project-to-Job today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          <input
            name="name"
            placeholder={
              form.role === "company"
                ? "Recruiter Name"
                : "Full Name"
            }
            onChange={handleChange}
            required
          />

          <input
            name="email"
            placeholder="Email address"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          {/* ===== ROLE TOGGLE ===== */}
          <div className="role-toggle">
            <button
              type="button"
              className={form.role === "student" ? "active" : ""}
              onClick={() => handleRoleChange("student")}
            >
              Student
            </button>
            <button
              type="button"
              className={form.role === "company" ? "active" : ""}
              onClick={() => handleRoleChange("company")}
            >
              Company
            </button>
          </div>

          {/* ===== STUDENT FIELDS ===== */}
          {form.role === "student" && (
            <>
              <input
                name="college"
                placeholder="College Name"
                onChange={handleChange}
              />
              <input
                name="branch"
                placeholder="Branch"
                onChange={handleChange}
              />
              <input
                name="cgpa"
                type="number"
                step="0.01"
                placeholder="CGPA"
                onChange={handleChange}
              />
              <input
                name="graduationYear"
                type="number"
                placeholder="Graduation Year"
                onChange={handleChange}
              />
              
              <input
                name="skills"
                placeholder="Skills (comma separated)"
                onChange={handleChange}
              />
              <input
                name="githubUsername"
                placeholder="GitHub Username (required)"
                onChange={handleChange}
                required
              />
            </>
          )}

          {/* ===== COMPANY FIELDS ===== */}
          {form.role === "company" && (
            <>
              <input
                name="companyName"
                placeholder="Company Name"
                onChange={handleChange}
              />
              <input
                name="industry"
                placeholder="Industry"
                onChange={handleChange}
              />
              <input
                name="companySize"
                placeholder="Company Size (e.g. 50-100)"
                onChange={handleChange}
              />
            </>
          )}

          <button type="submit">Create Account</button>

        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}