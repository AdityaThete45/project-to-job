import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const StudentProfile = () => {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [trust, setTrust] = useState(null);

  useEffect(() => {
    fetchStudent();
    fetchProjects();
    fetchTrust();
  }, []);

  const fetchStudent = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${id}`);
      setStudent(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/projects/student/${id}`
      );
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTrust = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/users/${id}/trust`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTrust(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!student) return <p>Loading...</p>;

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto" }}>
      
      {/* STUDENT INFO */}
      <h2>{student.name}</h2>
      <p>{student.email}</p>

      <p>
        <b>College:</b> {student.college} | 
        <b> CGPA:</b> {student.cgpa} | 
        <b> Graduation:</b> {student.graduationYear}
      </p>

      {/* SKILLS */}
      <div style={{ marginTop: "10px" }}>
        <h3>Skills</h3>
        {student.skills &&
          student.skills.map((skill, index) => (
            <span
              key={index}
              style={{
                background: "#eee",
                padding: "5px 10px",
                borderRadius: "15px",
                marginRight: "8px",
              }}
            >
              {skill}
            </span>
          ))}
      </div>

      {/* TRUST METRICS */}
      {trust && (
        <div
          style={{
            marginTop: "30px",
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "10px",
            background: "#f8f8f8",
          }}
        >
          <h3>Trust Metrics</h3>

          <p>Total Projects: {trust.totalProjects}</p>
          <p>Average Proof Score: {trust.avgProofScore}</p>
          <p>Verified Projects: {trust.verifiedProjects}</p>
          <p>Companies Interested: {trust.totalShortlists}</p>
          <p>Interview Requests: {trust.totalInterviews}</p>
          <p>Acceptance Rate: {trust.acceptanceRate}%</p>
        </div>
      )}

      {/* PROJECTS */}
      <div style={{ marginTop: "30px" }}>
        <h3>Projects</h3>

        {projects.map((project) => (
          <div
            key={project._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
            }}
          >
            <h4>
              {project.title}
              {project.isVerified && (
                <span style={{ color: "green", marginLeft: "10px" }}>
                  ✔ Verified
                </span>
              )}
            </h4>

            <p>{project.description}</p>

            <p>
              <b>Tech Stack:</b> {project.techStack.join(", ")}
            </p>

            <p>
              <b>Proof Score:</b> {project.proofScore}
            </p>

            {project.videoLink && (
              <video
                width="100%"
                controls
                style={{ marginTop: "10px", borderRadius: "8px" }}
              >
                <source src={project.videoLink} />
              </video>
            )}

            <p style={{ marginTop: "10px" }}>
              <a href={project.githubLink} target="_blank" rel="noreferrer">
                View GitHub Repository
              </a>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentProfile;