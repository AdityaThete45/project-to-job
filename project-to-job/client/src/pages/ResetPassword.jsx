import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Reset token is missing.");
    }
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setError("Reset token is missing. Please request a new link.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await resetPassword(token, form.password);
      setMessage(data.message || "Password reset successful! Redirecting to login...");
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo flex flex-col items-center">
          <img
            src="/p2j_logo.png"
            alt="P2J Logo"
            className="w-14 h-14 object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 mb-4"
          />
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Enter your new secure password</p>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "var(--radius)", fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: "#dcfce7", color: "#16a34a", padding: "14px", borderRadius: "var(--radius)", fontSize: 14, marginBottom: 16, textAlign: "center" }}>
            {message}
          </div>
        )}

        {!message && token && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                className="form-input"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                name="confirmPassword"
                type="password"
                placeholder="Re-type your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={{ marginTop: 4 }}
              disabled={loading}
            >
              {loading ? "Resetting password…" : "Reset Password"}
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: 16 }}>
          Back to <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
