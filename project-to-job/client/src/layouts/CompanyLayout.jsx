import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { LayoutDashboard, Search, Star, CalendarDays } from "lucide-react";

const COMPANY_MENU = [
  { key: "dashboard", label: "Dashboard" },
  { key: "search", label: "Search Projects" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interviews", label: "Interviews" }
];

export default function CompanyLayout({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active key from current path
  const pathSegment = location.pathname.split("/company/")[1]?.split("/")[0] || "dashboard";
  const active = pathSegment === "" ? "dashboard" : pathSegment;

  const handleMenuClick = (key) => {
    if (key === "dashboard") navigate("/company");
    else navigate(`/company/${key}`);
  };

  return (
    <div className="dashboard">
      <Sidebar
        menuItems={COMPANY_MENU}
        active={active}
        setActive={handleMenuClick}
        onLogout={onLogout}
      />
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}