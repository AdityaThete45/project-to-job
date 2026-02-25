import {
  Folder,
  MessageSquare,
  TrendingUp,
  Star,
} from "lucide-react";

export default function StatCard({ type, value, label }) {

  const iconMap = {
    projects: <Folder size={20} />,
    interviews: <MessageSquare size={20} />,
    authenticity: <TrendingUp size={20} />,
    shortlist: <Star size={20} />,   // ⭐ This is new
  };

  return (
    <div className="stat-card">
      <div className="stat-icon">
        {iconMap[type]}
      </div>

      <div>
        <div className="stat-number">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}