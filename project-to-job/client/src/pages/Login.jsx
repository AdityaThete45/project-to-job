import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import "../styles/auth.css";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(form);

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        onLogin(data);

        navigate(data.role === "student" ? "/student" : "/company");
      } else {
        alert("Invalid credentials");
      }
    } catch (err) {
      alert("Login error");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <div className="auth-header">
          <img src="/image.png" alt="P2J" />
          <h2>Welcome Back</h2>
          <p>Login to continue to Project-to-Job</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button type="submit">Login</button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link to="/signup">Create one</Link>
        </p>

      </div>
    </div>
  );
}