import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { LayoutDashboard, Search, Star, CalendarDays } from "lucide-react";

const COMPANY_MENU = [
  { key: "dashboard", label: "Dashboard" },
  { key: "search", label: "Search Projects" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interviews", label: "Interviews" }
];

import { useTheme } from "../context/ThemeContext";
import { useSocket } from "../hooks/useSocket";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function CompanyLayout({ userId, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [toast, setToast] = useState(null);

  useSocket(userId, (notification) => {
    let msg = "";
    if (notification.type === "INTERVIEW_RESPONSE") {
      msg = `📣 Student ${notification.payload.studentName} has ${notification.payload.status} your interview invitation!`;
    }
    if (msg) {
      setToast(msg);
      setTimeout(() => setToast(null), 6000);
    }
  });

  // Derive active key from current path
  const pathSegment = location.pathname.split("/company/")[1]?.split("/")[0] || "dashboard";
  const active = pathSegment === "" ? "dashboard" : pathSegment;

  const handleMenuClick = (key) => {
    if (key === "dashboard") navigate("/company");
    else navigate(`/company/${key}`);
  };

  return (
    <div className="dashboard min-h-screen bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200 relative">
      <Sidebar
        menuItems={COMPANY_MENU}
        active={active}
        setActive={handleMenuClick}
        onLogout={onLogout}
      />

      {/* Real-time Toast Alerts */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm bg-indigo-950/90 border border-indigo-500/30 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-bounce flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Sparkles size={16} />
          </div>
          <span className="text-xs font-semibold leading-normal">{toast}</span>
        </div>
      )}

      <div className="main flex-1 p-6 md:p-10 ml-0 md:ml-[260px] min-h-screen">
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
              Recruiter Analytics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Find, assess, and filter talent using real project authentication.
            </p>
          </div>
          <button 
            onClick={toggleTheme} 
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850/50 text-slate-700 dark:text-slate-300 transition-colors shadow-sm cursor-pointer"
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}