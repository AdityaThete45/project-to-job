import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return setError("Email and password are required.");
    setLoading(true);
    try {
      const data = await loginUser(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId || "");
      onLogin(data);
      navigate(data.role === "student" ? "/student" : "/company");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo flex flex-col items-center">
          <img src="/p2j_logo.png" alt="P2J Logo" className="w-14 h-14 object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 mb-4" />
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to Project-to-Job</p>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "var(--radius)", fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" name="email" type="email" placeholder="you@example.com" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="form-label mb-0">Password</label>
              <Link to="/forgot-password" style={{ fontSize: 13, color: "var(--primary)" }}>Forgot password?</Link>
            </div>
            <input className="form-input" name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}