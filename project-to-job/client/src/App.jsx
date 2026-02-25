import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";

import CompanyDashboard from "./pages/CompanyDashboard";
import CompanySearch from "./pages/CompanySearch";
import CompanyShortlisted from "./pages/CompanyShortlisted";
import CompanyInterviews from "./pages/CompanyInterviews";
import CompanyLayout from "./layouts/CompanyLayout";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectPreview from "./pages/ProjectPreview";

function App() {

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  const handleLogin = (data) => {
    setToken(data.token);
    setRole(data.role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* ===== PUBLIC ROUTES ===== */}

        <Route path="/" element={<Landing />} />

        <Route
          path="/login"
          element={
            token
              ? <Navigate to={role === "student" ? "/student" : "/company"} />
              : <Login onLogin={handleLogin} />
          }
        />

        <Route
          path="/signup"
          element={
            token
              ? <Navigate to={role === "student" ? "/student" : "/company"} />
              : <Signup />
          }
        />

        {/* ===== STUDENT ROUTE ===== */}
        <Route
          path="/student"
          element={
            token && role === "student"
              ? <StudentDashboard token={token} onLogout={handleLogout} />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/student/preview/:id"
          element={
            token && role === "student"
              ? <ProjectPreview token={token} />
              : <Navigate to="/" />
          }
        />

        {/* ===== COMPANY ROUTES ===== */}
        <Route
          path="/company"
          element={
            token && role === "company"
              ? <CompanyLayout onLogout={handleLogout} />
              : <Navigate to="/" />
          }
        >
          <Route index element={<CompanyDashboard token={token} />} />
          <Route path="search" element={<CompanySearch token={token} />} />
          <Route path="shortlisted" element={<CompanyShortlisted token={token} />} />
          <Route path="interviews" element={<CompanyInterviews token={token} />} />
          <Route path="project/:id" element={<ProjectDetail token={token} />} />
        </Route>

        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;