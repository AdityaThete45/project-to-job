import { LayoutDashboard, Folder, MessageSquare, User, LogOut, Star, Search, CalendarDays } from "lucide-react";

const iconMap = {
  dashboard: <LayoutDashboard size={17} />,
  projects: <Folder size={17} />,
  interviews: <MessageSquare size={17} />,
  profile: <User size={17} />,
  shortlists: <Star size={17} />,
  search: <Search size={17} />,
  calendar: <CalendarDays size={17} />
};

export default function Sidebar({ menuItems, active, setActive, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <img src="/image.png" alt="P2J" />
          <span>Project2Job</span>
        </div>

        <nav className="menu">
          {menuItems.map((item) => (
            <div
              key={item.key}
              className={`menu-item ${active === item.key ? "active" : ""}`}
              onClick={() => setActive(item.key)}
            >
              <span className="menu-icon">{iconMap[item.key]}</span>
              {item.label}
            </div>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );
}