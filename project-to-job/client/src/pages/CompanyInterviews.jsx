import { useEffect, useState } from "react";
import axios from "axios";

export default function CompanyInterviews({ token }) {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/interviews/company",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setInterviews(res.data || []);
  };

  return (
    <>
      <h1 className="title">Interviews</h1>

      {interviews.map((i) => (
        <div key={i._id} className="interview-card">
          <div>
            <h4>{i.student?.name}</h4>
            <p>Status: {i.status}</p>
          </div>
        </div>
      ))}
    </>
  );
}