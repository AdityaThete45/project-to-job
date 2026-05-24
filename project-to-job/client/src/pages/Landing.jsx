import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">
          <img src="/image.png" alt="P2J" />
          <span>Project2Job</span>
        </div>
        <div className="nav-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#proof-engine">Proof Engine</a>
          <Link to="/login" style={{ color: "var(--text-primary)" }}>Sign In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 99, padding: "6px 14px", fontSize: 13, marginBottom: 24, color: "rgba(255,255,255,0.8)" }}>
            ✨ AI-powered project authenticity scoring
          </div>
          <h1>
            Hire by Projects.<br />
            <span style={{ color: "#818cf8" }}>Not by Resumes.</span>
          </h1>
          <p>
            The first hiring platform where students prove their skills through real projects — analyzed by our GitHub Proof Engine.
          </p>
          <div className="hero-btns">
            <Link to="/signup" className="btn btn-primary" style={{ padding: "12px 28px", fontSize: 15 }}>
              Start for Free →
            </Link>
            <Link to="/login" className="btn" style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "12px 28px", fontSize: 15 }}>
              I'm a Company
            </Link>
          </div>
          {/* Mini stats */}
          <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 52, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 32 }}>
            {[["Proof Score", "AI-powered"], ["GitHub Verified", "Real projects only"], ["Shortlist System", "Zero resume clutter"]].map(([title, sub]) => (
              <div key={title} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "white" }}>{title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section id="how-it-works" style={{ padding: "80px 48px", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>The Problem</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px" }}>Traditional Hiring is Broken</h2>
          </div>
          <div className="features" style={{ padding: 0 }}>
            {[
              { icon: "📄", title: "Fake Resumes", text: "67% of candidates exaggerate skills on resumes. There's no way to verify claimed experience." },
              { icon: "📬", title: "Mass Applications", text: "Companies drown in irrelevant applications. Recruiters spend 6 seconds reading each resume." },
              { icon: "❓", title: "No Skill Proof", text: "Interviews can't reliably assess ability. Real-world project work is never evaluated." }
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-text">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF ENGINE */}
      <section id="proof-engine" style={{ padding: "80px 48px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Our Solution</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-1px", marginBottom: 20 }}>Proof Engine 3.4</h2>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>
              Every project is automatically analyzed across 5 dimensions — GitHub depth, commit consistency, repo structure, demo integrity, and technical explanation quality.
            </p>
            {[
              { label: "GitHub Depth Analysis", pct: 25, desc: "Repo age, stars, forks, update frequency" },
              { label: "Commit Consistency", pct: 20, desc: "Number and spread of real commits over time" },
              { label: "Repository Structure", pct: 20, desc: "Code quality indicators from file tree" },
              { label: "Demo Integrity", pct: 15, desc: "Video walkthrough + live demo presence" },
              { label: "Technical Explanation", pct: 20, desc: "Depth of description and role definition" }
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{item.label}</span>
                  <span style={{ color: "var(--text-muted)" }}>{item.pct} pts</span>
                </div>
                <div className="proof-bar" style={{ height: 6 }}>
                  <div className="proof-fill" style={{ width: `${item.pct}%`, background: "var(--accent)" }} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>Sample Project Score</h3>
                <span style={{ fontSize: 28, fontWeight: 800, color: "#16a34a" }}>82/100</span>
              </div>
              {[
                { label: "GitHub Depth", score: 20, max: 25 },
                { label: "Commit Consistency", score: 18, max: 20 },
                { label: "Repo Structure", score: 15, max: 20 },
                { label: "Demo Integrity", score: 15, max: 15 },
                { label: "Technical Detail", score: 14, max: 20 }
              ].map(item => (
                <div key={item.label} className="breakdown-row">
                  <span className="breakdown-label">{item.label}</span>
                  <div className="breakdown-bar">
                    <div className="breakdown-fill" style={{ width: `${(item.score / item.max) * 100}%`, background: "#16a34a" }} />
                  </div>
                  <span className="breakdown-score">{item.score}/{item.max}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--accent-light)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--accent)" }}>
                💡 High confidence in project authenticity. Strong candidate for technical roles.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 48px", background: "var(--brand)", color: "white", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
          Ready to hire smarter?
        </h2>
        <p style={{ fontSize: 16, opacity: 0.65, marginBottom: 32 }}>
          Join companies and students already using Project-to-Job.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/signup" className="btn" style={{ background: "white", color: "var(--brand)", padding: "12px 28px", fontSize: 15, fontWeight: 700 }}>
            Get Started Free
          </Link>
          <Link to="/login" className="btn" style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "12px 28px", fontSize: 15 }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "24px 48px", background: "var(--bg)", borderTop: "1px solid var(--border)", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
        © 2025 Project2Job. Built for the next generation of hiring.
      </footer>
    </div>
  );
}