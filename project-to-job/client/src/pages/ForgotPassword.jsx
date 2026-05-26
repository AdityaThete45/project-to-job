import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email address.");
    
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await requestPasswordReset(email);
      setMessage(data.message || "Instructions sent! Please check your email.");
    } catch (err) {
      setError(err.message || "Failed to process request. Please try again.");
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
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">Get recovery link for your account</p>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "var(--radius)", fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {message ? (
          <div style={{ background: "#dcfce7", color: "#16a34a", padding: "14px", borderRadius: "var(--radius)", fontSize: 14, marginBottom: 16, textAlign: "center", lineHeight: 1.5 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>📧 Check Your Inbox</p>
            {message}
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={{ marginTop: 4 }}
              disabled={loading}
            >
              {loading ? "Sending link…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: 16 }}>
          Remember your password? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
