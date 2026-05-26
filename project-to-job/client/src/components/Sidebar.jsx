import { LayoutDashboard, Folder, MessageSquare, User, LogOut, Star, Search, CalendarDays, Sparkles, FileText, Map, Calendar } from "lucide-react";

const iconMap = {
  dashboard: <LayoutDashboard size={17} />,
  projects: <Folder size={17} />,
  interviews: <MessageSquare size={17} />,
  profile: <User size={17} />,
  shortlists: <Star size={17} />,
  search: <Search size={17} />,
  calendar: <CalendarDays size={17} />,
  copilot: <Sparkles size={17} />,
  resume: <FileText size={17} />,
  mock: <Calendar size={17} />,
  roadmap: <Map size={17} />
};

export default function Sidebar({ menuItems, active, setActive, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo flex items-center gap-2">
          <img src="/p2j_logo.png" alt="P2J Logo" className="w-8 h-8 object-contain rounded-lg shadow-md border border-white/10" />
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