export default function ProgressBar({ value }) {
  const getColor = () => {
    if (value >= 75) return "#16a34a";
    if (value >= 50) return "#f59e0b";
    return "#dc2626";
  };

  return (
    <div
      style={{
        width: "100%",
        height: "10px",
        background: "#e5e7eb",
        borderRadius: "999px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          background: getColor(),
          borderRadius: "999px",
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}