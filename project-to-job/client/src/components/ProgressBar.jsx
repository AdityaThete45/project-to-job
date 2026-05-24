import { getScoreColor } from "../hooks/utils";

export default function ProgressBar({ value, max = 100, height = 5 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = getScoreColor((value / max) * 100);

  return (
    <div className="proof-bar" style={{ height }}>
      <div
        className="proof-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}