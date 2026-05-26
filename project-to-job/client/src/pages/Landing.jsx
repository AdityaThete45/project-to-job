import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle, GitBranch, ArrowRight, Code, ShieldCheck, Zap, AlertCircle, Menu, X } from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="landing bg-[#030712] text-slate-100 min-h-screen relative overflow-x-hidden font-sans">
      {/* Background Glowing Mesh Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* NAVBAR */}
      <nav className="landing-navbar fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-6xl z-50 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-2xl transition-all duration-300">
        <div className="nav-brand flex items-center gap-3">
          <img src="/p2j_logo.png" alt="P2J Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg border border-white/10" />
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">Project2Job</span>
        </div>
        
        {/* Desktop Links (Hidden on Mobile) */}
        <div className="nav-links hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">How It Works</a>
          <a href="#proof-engine" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">Proof Engine</a>
          <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">Sign In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 border border-indigo-500/30">Get Started</Link>
        </div>

        {/* Mobile Toggle Button (Visible only on Mobile) */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-xl border border-white/10 text-slate-200 hover:bg-white/5 cursor-pointer transition-colors"
          style={{ background: "none", border: "none" }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu Panel (Slide down using Framer Motion) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-4 right-4 mx-auto max-w-lg z-50 rounded-2xl border border-white/5 bg-slate-950/95 backdrop-blur-lg p-6 shadow-2xl flex flex-col gap-4 md:hidden"
          >
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5"
            >
              How It Works
            </a>
            <a 
              href="#proof-engine" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5"
            >
              Proof Engine
            </a>
            <Link 
              to="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 border border-indigo-500/30"
            >
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="hero pt-32 pb-20 px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-6 shadow-inner"
          >
            <Sparkles size={14} className="animate-pulse" />
            AI-Powered GitHub Verification Engine
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-gradient"
          >
            Hire by Projects.<br />
            <span className="text-indigo-400">Not by Resumes.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-slate-400 leading-relaxed mb-8 max-w-xl"
          >
            The first automated verification platform where students authenticate their skills through real repository audits — evaluated by our GitHub Proof Engine.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/signup" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all border border-indigo-500/20 flex items-center gap-2 group hover:scale-[1.02]">
              Start for Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="px-6 py-3 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 border border-slate-800 rounded-xl transition-all flex items-center gap-2 hover:scale-[1.02] backdrop-blur-sm">
              I'm a Recruiter
            </Link>
          </motion.div>

          {/* Core metrics bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 pt-10 mt-12 border-t border-slate-900"
          >
            {[
              { label: "Proof Score", value: "AI-powered" },
              { label: "GitHub Verified", value: "Real repos only" },
              { label: "Zero Noise", value: "ATS Filtered" }
            ].map((metric) => (
              <div key={metric.label}>
                <div className="text-sm font-bold text-slate-200">{metric.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{metric.value}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* 3D Dashboard Mockup Graphic on the Right */}
        <div className="lg:col-span-5 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: -15, rotateX: 10 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-sm aspect-[4/3] rounded-2xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(99,102,241,0.25)] animate-float-slow bg-gradient-to-tr from-slate-950 to-indigo-950/40 p-1 backdrop-blur-sm transform-gpu"
            style={{ perspective: 1200 }}
          >
            <img 
              src="/hero_dashboard.png" 
              alt="Interactive 3D Proof Engine Dashboard" 
              className="w-full h-full object-cover rounded-xl shadow-inner border border-white/5 opacity-90"
            />
            {/* Glossy Overlay Reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-2xl pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS / PROBLEMS */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-950/40 border-y border-slate-900/60 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">The Challenge</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2 tracking-tight">Traditional Hiring is Obsolete</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">Standard resume screens overlook talent and encourage credential inflation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <AlertCircle size={24} className="text-rose-400" />, title: "Exaggerated Credentials", desc: "Up to 67% of resumes contain embellishments. Text-only resumes cannot verify true competency." },
              { icon: <Code size={24} className="text-indigo-400" />, title: "Project Copy-Pasting", desc: "Tutorial copy-pasting is rampant. Repetitive boilerplate projects make candidates look uniform." },
              { icon: <Zap size={24} className="text-amber-400" />, title: "Six-Second Review Limit", desc: "Recruiters spend seconds per resume, skipping deep-skill portfolios and hiring based on school pedigree." }
            ].map((p, idx) => (
              <motion.div 
                key={p.title}
                whileHover={{ y: -8, rotateX: 2, rotateY: -2, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-card rounded-2xl p-6 border border-white/5 text-left transform-gpu"
              >
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-white/10">
                  {p.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF ENGINE DETAIL */}
      <section id="proof-engine" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">Real Validation</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2 tracking-tight mb-6">GitHub Proof Engine v3.4</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-8">
              Every project is automatically audited on the backend. We check commit timelines, lines of code, code architecture, and original explanations to score project validity.
            </p>

            <div className="space-y-6">
              {[
                { label: "GitHub Architecture Depth", pct: 85, color: "bg-indigo-500" },
                { label: "Commit Distribution Consistency", pct: 75, color: "bg-purple-500" },
                { label: "Repository Structure & Modularization", pct: 80, color: "bg-blue-500" },
                { label: "AI Explanatory Validation", pct: 90, color: "bg-emerald-500" }
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                    <span>{item.label}</span>
                    <span>{item.pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Card Mockup */}
          <div className="flex justify-center">
            <motion.div 
              whileHover={{ rotateX: 3, rotateY: -3, scale: 1.02 }}
              className="glass-card rounded-3xl p-8 border border-white/5 w-full max-w-md shadow-2xl relative overflow-hidden transform-gpu"
              style={{ perspective: 1000 }}
            >
              {/* Card top banner glow */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Authenticity Audit</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Sample Repository Score</p>
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                  92<span className="text-xs text-emerald-500 font-medium">/100</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  { label: "Commit Timeline Spread", score: "High", color: "text-emerald-400" },
                  { label: "Original Architecture Patterns", score: "Excellent", color: "text-emerald-400" },
                  { label: "Duplicate Repo Check", score: "Passed", color: "text-emerald-400" },
                  { label: "Walkthrough Alignment", score: "96%", color: "text-emerald-400" }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-xs border-b border-slate-900 pb-2">
                    <span className="text-slate-400">{item.label}</span>
                    <span className={`font-semibold ${item.color}`}>{item.score}</span>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-950/10 border border-emerald-500/10 p-4 rounded-2xl flex gap-3 text-left">
                <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300/80 leading-relaxed">
                  Verified original codebase. No boilerplate template or plagiarism matched. Highly recommended.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 text-center border-t border-slate-900 relative bg-gradient-to-b from-[#030712] to-[#0c0a25]">
        <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Ready to Build a High-Trust Portfolio?
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Join the automated project verification platform that bridges verified skillsets with modern tech recruiters.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all border border-indigo-500/20 hover:scale-[1.02]">
              Get Started Free
            </Link>
            <Link to="/login" className="px-8 py-3 bg-slate-950/80 border border-slate-800 hover:bg-slate-900 text-slate-300 font-semibold rounded-xl transition-all hover:scale-[1.02]">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 bg-[#030712] border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/p2j_logo.png" alt="P2J Logo" className="w-8 h-8 object-contain rounded-lg shadow-md border border-white/5" />
            <span className="font-bold text-sm text-slate-300">Project2Job</span>
          </div>
          <div>© 2026 Project2Job. All rights reserved. Transforming technical recruitment.</div>
        </div>
      </footer>
    </div>
  );
}