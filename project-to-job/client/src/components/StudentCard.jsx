import axios from "axios";

export default function StudentCard({ student, token }) {
  const shortlist = async () => {
    await axios.post(
      "http://localhost:5000/api/shortlist",
      { studentId: student._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Student shortlisted!");
  };

  return (
    <div className="card enhanced-card">
      <h3>{student.name}</h3>
      <p>{student.email}</p>

      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <button className="secondary-btn" onClick={shortlist}>
          Shortlist
        </button>
      </div>
    </div>
  );
}