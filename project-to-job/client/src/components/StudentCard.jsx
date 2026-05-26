import { Star, GraduationCap, Code } from "lucide-react";
import { addToShortlist } from "../services/api";

export default function StudentCard({ student, token }) {

  const shortlist = async () => {
    try {
      await addToShortlist({ studentId: student._id });
      alert("Student shortlisted!");
    } catch (err) {
      console.error("Shortlist error:", err);
      alert(err.message || "Failed to shortlist student.");
    }
  };

  return (
    <div className="student-card upgraded-student">
      <div className="student-header">
        <h3>{student.name}</h3>
        <span className="cgpa-badge">
          CGPA: {student.cgpa || "N/A"}
        </span>
      </div>

      <p className="student-email">{student.email}</p>

      <div className="student-info">
        <div>
          <GraduationCap size={14} />
          {student.college || "College N/A"}
        </div>
        <div>
          <Code size={14} />
          {student.branch || "Branch N/A"}
        </div>
      </div>

      <div className="student-skills">
        {student.skills?.slice(0, 4).map((skill, i) => (
          <span key={i} className="tag">
            {skill}
          </span>
        ))}
      </div>

      <button className="shortlist-btn" onClick={shortlist}>
        <Star size={14} />
        Shortlist Candidate
      </button>
    </div>
  );
}