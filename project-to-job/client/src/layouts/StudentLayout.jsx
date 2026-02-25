import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function StudentLayout({ onLogout }) {
  return (
    <div className="dashboard">
      <Sidebar
        menuItems={[
          { key: "dashboard", label: "Dashboard", path: "/student" },
          { key: "projects", label: "My Projects", path: "/student/projects" },
          { key: "interviews", label: "Interview Requests", path: "/student/interviews" },
          { key: "shortlists", label: "Shortlisted By Companies", path: "/student/shortlists" },
          { key: "profile", label: "Profile", path: "/student/profile" },
        ]}
        onLogout={onLogout}
      />
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}