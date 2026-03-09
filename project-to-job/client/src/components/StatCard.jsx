import {
  Folder,
  MessageSquare,
  TrendingUp,
  Star,
} from "lucide-react";

export default function StatCard({ type, value, label }) {

  const iconMap = {
    projects: <Folder size={22} />,
    interviews: <MessageSquare size={22} />,
    proof: <TrendingUp size={22} />,
    shortlist: <Star size={22} />,
  };

  return (
    <div className="stat-card upgraded-stat">
      <div className="stat-icon">
        {iconMap[type]}
      </div>

      <div className="stat-content">
        <div className="stat-number">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}