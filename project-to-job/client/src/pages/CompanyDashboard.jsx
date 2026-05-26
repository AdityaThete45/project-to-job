import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchProjects, getCompanyStats, addToShortlist, sendInterviewRequest, getTopCandidates } from "../services/api";
import { getScoreColor, getVideoThumbnail, getTrustRankStyle } from "../hooks/utils";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import { SkeletonCard, SkeletonStat } from "../components/Skeleton";
import { LayoutDashboard, Star, CalendarDays, Users, TrendingUp, Award, Search, Sparkles, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function CompanyDashboard({ token }) {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [topCandidates, setTopCandidates] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [actionLoading, setActionLoading] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projData, statsData, topData] = await Promise.allSettled([
        searchProjects({ minScore: 0 }),
        getCompanyStats(),
        getTopCandidates(5)
      ]);

      const projs = (projData.value || []).sort((a, b) => b.proofScore - a.proofScore);
      setProjects(projs);
      setStats(statsData.value || null);
      setTopCandidates(topData.value || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (e, project) => {
    e.stopPropagation();
    const key = `sl-${project._id}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      await addToShortlist({ studentId: project.student._id, projectId: project._id });
      setShortlistedIds(prev => new Set([...prev, project._id]));
    } catch (err) {
      setShortlistedIds(prev => new Set([...prev, project._id]));
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleInterview = async (e, project) => {
    e.stopPropagation();
    const key = `int-${project._id}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      await sendInterviewRequest({
        studentId: project.student._id,
        projectId: project._id,
        message: "We are interested in your project and would like to discuss further."
      });
      setRequestedIds(prev => new Set([...prev, project.student._id]));
    } catch (err) {
      setRequestedIds(prev => new Set([...prev, project.student._id]));
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const featuredProjects = projects.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => <SkeletonStat key={i} />)
        ) : (
          <>
            <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-500/20 transition-all duration-350 shadow-md">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Projects</div>
                <div className="text-xl font-bold text-[var(--text-primary)] mt-0.5">{stats?.totalProjects || projects.length}</div>
              </div>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl flex items-center gap-4 hover:border-purple-500/20 transition-all duration-350 shadow-md">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                <Star size={20} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Shortlisted</div>
                <div className="text-xl font-bold text-[var(--text-primary)] mt-0.5">{stats?.shortlistCount || 0}</div>
              </div>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl flex items-center gap-4 hover:border-amber-500/20 transition-all duration-350 shadow-md">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                <CalendarDays size={20} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Interviews Sent</div>
                <div className="text-xl font-bold text-[var(--text-primary)] mt-0.5">{stats?.interviewCount || 0}</div>
              </div>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl flex items-center gap-4 hover:border-emerald-500/20 transition-all duration-350 shadow-md">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <Users size={20} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Accepted Offers</div>
                <div className="text-xl font-bold text-[var(--text-primary)] mt-0.5">{stats?.acceptedCount || 0}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Top Candidates Carousel */}
      {!loading && topCandidates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400 animate-bounce" size={20} />
            <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">Trust-Ranked Candidates</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
            {topCandidates.map((c) => {
              const rankStyle = getTrustRankStyle(c.trustRank);
              return (
                <div 
                  key={c._id} 
                  onClick={() => navigate(`/company/student/${c._id}`)}
                  className="bg-[var(--surface)] hover:bg-[var(--border-light)] border border-[var(--border)] hover:border-indigo-500/30 p-5 rounded-2xl text-center min-w-[210px] cursor-pointer transition-all duration-300 shadow-lg flex flex-col items-center shrink-0"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-lg font-black mb-3 border border-indigo-500/20">
                    {c.name?.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] truncate max-w-full">{c.name}</h4>
                  <p className="text-xs text-[var(--text-secondary)] truncate max-w-full mt-0.5 mb-3">{c.college || "Student"}</p>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold border" style={{ background: rankStyle.bg, color: rankStyle.color, borderColor: rankStyle.border }}>
                    {c.trustRank || "Unranked"}
                  </span>
                  <div className="mt-4 text-xs text-[var(--text-secondary)] font-medium">
                    {c.totalProjects} projects · <span className="text-emerald-500">{c.verifiedProjects} verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Verified Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-indigo-400" size={20} />
            <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">Verified Technical Projects</h3>
          </div>
          <button 
            onClick={() => navigate("/company/search")}
            className="text-xs text-indigo-450 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Search size={13} /> Browse all
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map(project => {
              const thumb = getVideoThumbnail(project.videoLink);
              const isShortlisted = shortlistedIds.has(project._id);
              const isRequested = requestedIds.has(project.student?._id);

              return (
                <div
                  key={project._id}
                  onClick={() => navigate(`/company/project/${project._id}`)}
                  className="group bg-[var(--surface)] border border-[var(--border)] hover:border-indigo-500/25 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg flex flex-col"
                >
                  {/* Thumbnail Overlay */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden shrink-0">
                    {thumb ? (
                      <img src={thumb} alt={project.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center text-slate-650 text-2xl font-bold">💻</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                    {project.isVerified && (
                      <span className="absolute top-3.5 right-3.5 text-[9px] font-bold px-2 py-0.5 bg-emerald-500 text-white rounded-md uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        ✓ Verified
                      </span>
                    )}
                    <h4 className="absolute bottom-3 left-4 right-4 text-sm font-bold text-white line-clamp-1">{project.title}</h4>
                  </div>

                  {/* Body details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {project.shortlistCount > 0 && (
                        <div className="text-[10px] text-amber-500 dark:text-amber-400 font-bold uppercase tracking-wider mb-2">
                          🔥 {project.shortlistCount} Shortlists
                        </div>
                      )}
                      <p className="text-xs text-[var(--text-secondary)]">
                        by <strong className="text-[var(--text-primary)]">{project.student?.name}</strong>
                        {project.student?.trustRank && project.student.trustRank !== "Unranked" && (
                          <span className="ml-1.5 font-bold text-indigo-500 dark:text-indigo-400">{project.student.trustRank}</span>
                        )}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mt-3 mb-4">
                        {project.techStack?.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-[var(--border-light)] border border-[var(--border)] text-[var(--text-secondary)] rounded-md font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Proof score */}
                      <div>
                        <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] font-medium mb-1.5">
                          <span>Proof Index</span>
                          <span style={{ color: getScoreColor(project.proofScore) }} className="font-bold">{project.proofScore}/100</span>
                        </div>
                        <ProgressBar value={project.proofScore} height={4.5} />
                      </div>

                      {/* Recruiter quick actions */}
                      <div className="flex gap-2 pt-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => handleShortlist(e, project)}
                          disabled={isShortlisted || actionLoading[`sl-${project._id}`]}
                          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            isShortlisted
                              ? "bg-[var(--accent-light)] border-[var(--accent)]/20 text-[var(--accent)]"
                              : "bg-[var(--border-light)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-secondary)]"
                          }`}
                        >
                          {isShortlisted ? "Saved" : "Save"}
                        </button>
                        <button
                          onClick={e => handleInterview(e, project)}
                          disabled={isRequested || actionLoading[`int-${project._id}`]}
                          className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white shadow-sm shadow-indigo-600/10 cursor-pointer disabled:opacity-50 disabled:hover:bg-indigo-650 transition-colors"
                        >
                          {isRequested ? "Request Sent" : "Request Interview"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}