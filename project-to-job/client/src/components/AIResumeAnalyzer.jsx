import React, { useState } from "react";
import { analyzeResume } from "../services/api";
import { CheckCircle2, AlertTriangle, Sparkles, BookOpen, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function AIResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume text first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await analyzeResume(resumeText, jobDescription);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl w-full text-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI ATS Resume Analyzer</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Scan and score your resume alignment with standard job benchmarks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Paste Resume Text
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste raw text from your PDF/Word resume..."
            className="w-full h-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-300 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Target Job Description (Optional)
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job role descriptions to evaluate match..."
            className="w-full h-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-300 resize-none"
          />
        </div>
      </div>

      {error && <p className="text-rose-600 dark:text-rose-400 text-xs mb-4">{error}</p>}

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Sparkles size={16} className="animate-spin" />
            <span>Analyzing ATS Criteria...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>Analyze Resume Alignment</span>
          </>
        )}
      </button>

      {/* Results View */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ATS Meter */}
            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 rounded-xl p-5 flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${result.atsScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-slate-800 dark:text-white">
                  {result.atsScore}%
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">ATS Compatibility Score</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Match score based on semantic indexing & resume patterns.</p>
              </div>
            </div>

            {/* Job Match Meter */}
            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 rounded-xl p-5 flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-500"
                    strokeDasharray={`${result.matchPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-slate-800 dark:text-white">
                  {result.matchPercentage}%
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Job Requirements Fit</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Keyword correlation to target job posting parameters.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Extracted Skills */}
            <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/40 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-3 text-slate-600 dark:text-slate-300">
                <CheckCircle2 size={15} className="text-emerald-500 dark:text-emerald-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider">Identified Core Skills</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.skillsExtracted?.map((s, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700/30 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/40 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-3 text-slate-600 dark:text-slate-300">
                <AlertTriangle size={15} className="text-amber-500 dark:text-amber-400 animate-bounce" />
                <h4 className="text-xs font-semibold uppercase tracking-wider">Missing Target Keywords</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords?.map((k, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-500/20 font-medium">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/40 rounded-xl p-5">
            <div className="flex items-center gap-1.5 mb-3 text-slate-600 dark:text-slate-300">
              <BookOpen size={15} className="text-indigo-500 dark:text-indigo-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider">ATS Improvement Roadmap</h4>
            </div>
            <ul className="space-y-2.5">
              {result.suggestions?.map((s, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-sm text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 shrink-0 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                    {idx + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
