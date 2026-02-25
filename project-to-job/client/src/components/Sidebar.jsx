import {
  LayoutDashboard,
  Folder,
  MessageSquare,
  User,
  LogOut,
  Star,
} from "lucide-react";
import "../styles/dashboard.css";

export default function Sidebar({ menuItems, active, setActive, onLogout }) {
  const iconMap = {
    dashboard: <LayoutDashboard size={18} />,
    projects: <Folder size={18} />,
    interviews: <MessageSquare size={18} />,
    profile: <User size={18} />,
    shortlists: <Star size={18} />, // ⭐ Added icon
  };

  return (
    <div className="sidebar">
      {/* TOP SECTION */}
      <div className="sidebar-top">
        <div className="logo">
          <img src="/image.png" alt="Project to Job" />
        </div>

        <div className="menu">
          {menuItems.map((item) => (
            <div
              key={item.key}
              className={`menu-item ${active === item.key ? "active" : ""
                }`}
              onClick={() => setActive(item.key)}
            >
              <span className="menu-icon">
                {iconMap[item.key]}
              </span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="sidebar-bottom">
        <button className="logout" onClick={onLogout}>
          <LogOut size={16} style={{ marginRight: "6px" }} />
          Logout
        </button>
      </div>
    </div>
  );
}