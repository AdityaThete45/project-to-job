import React, { useState } from "react";
import { generateRoadmap } from "../services/api";
import { Sparkles, Map, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function AIRoadmap() {
  const [skills, setSkills] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [weakAreas, setWeakAreas] = useState("");
  const [goals, setGoals] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!skills.trim() || !goals.trim()) {
      setError("Skills and goals are required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await generateRoadmap({
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        targetCompany,
        weakAreas,
        goals
      });
      setResult(data.roadmap);
    } catch (err) {
      console.error(err);
      setError("Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl w-full text-[var(--text-primary)]">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-550 dark:text-indigo-400">
          <Map size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">AI Learning Roadmap Generator</h3>
          <p className="text-xs text-[var(--text-secondary)]">Build a personalized week-by-week learning syllabus aligned with job goals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="form-group">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
            Your Core Skills (comma separated)
          </label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. React, JavaScript, Node.js"
            className="w-full bg-[var(--border-light)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-[var(--text-primary)]"
          />
        </div>

        <div className="form-group">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
            Target Company (optional)
          </label>
          <input
            type="text"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            placeholder="e.g. Vercel, Linear, Stripe"
            className="w-full bg-[var(--border-light)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-[var(--text-primary)]"
          />
        </div>

        <div className="form-group">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
            Key Weak Areas to Fix
          </label>
          <input
            type="text"
            value={weakAreas}
            onChange={(e) => setWeakAreas(e.target.value)}
            placeholder="e.g. Database indexes, Testing with Jest, Docker"
            className="w-full bg-[var(--border-light)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-[var(--text-primary)]"
          />
        </div>

        <div className="form-group">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
            Target Job Goals
          </label>
          <input
            type="text"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="e.g. Land a Full Stack developer role in 3 months"
            className="w-full bg-[var(--border-light)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-[var(--text-primary)]"
          />
        </div>
      </div>

      {error && <p className="text-rose-450 dark:text-rose-400 text-xs mb-4">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-indigo-650 to-indigo-650 hover:from-indigo-550 hover:to-indigo-550 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Sparkles size={16} className="animate-spin" />
            <span>Formulating Weekly Syllabus...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>Generate Roadmap</span>
          </>
        )}
      </button>

      {/* Results View */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 border-t border-[var(--border)] pt-6"
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Syllabus Outline
            </h4>
            <button
              onClick={handleCopy}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 bg-[var(--surface)] px-3 py-1.5 rounded-lg border border-[var(--border)] cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Markdown"}</span>
            </button>
          </div>
          <div className="bg-[var(--border-light)] border border-[var(--border)] p-5 rounded-xl text-sm leading-relaxed text-[var(--text-primary)] max-h-[420px] overflow-y-auto whitespace-pre-line font-sans scrollbar-thin">
            {result}
          </div>
        </motion.div>
      )}
    </div>
  );
}
