import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Star,
  CalendarDays,
  LogOut,
} from "lucide-react";
import "../styles/dashboard.css";

export default function CompanyLayout({ onLogout }) {
  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <div className="sidebar">

        {/* Top Scrollable Area */}
        <div className="sidebar-top">

          {/* LOGO */}
          <div className="logo">
            <img src="/image.png" alt="P2J Logo" />
            <span className="logo-text">P2J</span>
          </div>

          <div className="menu">
            <NavLink
              to="/company"
              end
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>

            <NavLink
              to="/company/search"
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
            >
              <Search size={18} />
              Search Students
            </NavLink>

            <NavLink
              to="/company/shortlisted"
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
            >
              <Star size={18} />
              Shortlisted
            </NavLink>

            <NavLink
              to="/company/interviews"
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
            >
              <CalendarDays size={18} />
              Interviews
            </NavLink>
          </div>
        </div>

        {/* Fixed Bottom */}
        <div className="sidebar-bottom">
          <button className="logout" onClick={onLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}