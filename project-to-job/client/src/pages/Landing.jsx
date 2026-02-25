import { Link } from "react-router-dom";
import "../styles/landing.css";

export default function Landing() {
  return (
    <div className="landing">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">
          <img src="/image.png" alt="P2J" />
          <span>P2J</span>
        </div>

        <div className="nav-links">
          <Link to="/student">Get Hired</Link>
          <Link to="/company">Hire Talent</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Hire by Projects. <br />
            Not by Resumes.
          </h1>

          <p>
            A project-first hiring platform where real skills
            replace fake CVs.
          </p>

          <div className="hero-buttons">
            <Link to="/login" className="primary-btn">
              Get Started as Student
            </Link>
            <Link to="/login" className="secondary-btn">
              Hire Talent
            </Link>
          </div>
        </div>
      </section>

   

      {/* SOLUTION SECTION */}
     <section className="section dark">
  <h2>Traditional Hiring is Broken</h2>

  <div className="problem-grid">
    <div className="problem-card glow">
      <h3>Fake Resumes</h3>
      <p>No proof of real-world skills.</p>
    </div>

    <div className="problem-card glow">
      <h3>Mass Applications</h3>
      <p>Companies overwhelmed with irrelevant profiles.</p>
    </div>

    <div className="problem-card glow">
      <h3>No Skill Validation</h3>
      <p>No authenticity or technical evaluation.</p>
    </div>
  </div>
</section>

    </div>
  );
}