import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchStudent();
    fetchProjects();
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
      const res = await axios.get(`http://localhost:5000/api/projects/student/${id}`);
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!student) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{student.name}</h2>
      <p>Email: {student.email}</p>

      <h3>Projects</h3>

      {projects.map((project) => (
        <div
          key={project._id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <h4>{project.title}</h4>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
};

export default StudentProfile;
