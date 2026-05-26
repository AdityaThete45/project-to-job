const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ===== CORE FETCH HELPER =====
const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = { ...options.headers };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ===== AUTH =====
export const registerUser = (data) =>
  apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) });

export const loginUser = (data) =>
  apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) });

// ===== USER / PROFILE =====
export const getMyProfile = () => apiFetch("/users/me");

export const updateProfile = (data) =>
  apiFetch("/users/me", { method: "PUT", body: JSON.stringify(data) });

export const getStudentTrustMetrics = (userId) =>
  apiFetch(`/users/${userId}/trust`);

// ===== PROJECTS =====
export const getMyProjects = () => apiFetch("/projects/my-projects");

export const createProject = (formData) =>
  apiFetch("/projects", { method: "POST", body: formData });

export const getProjectById = (id) => apiFetch(`/projects/${id}`);

export const getProjectActionStatus = (projectId) =>
  apiFetch(`/projects/${projectId}/status`);

export const deleteProject = (id) =>
  apiFetch(`/projects/${id}`, { method: "DELETE" });

// ===== COMPANY =====
export const searchProjects = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/company/search${qs ? `?${qs}` : ""}`);
};

export const getCompanyStats = () => apiFetch("/company/stats");

export const getTopCandidates = (limit = 10) =>
  apiFetch(`/company/top-candidates?limit=${limit}`);

export const getStudentProfile = (id) => apiFetch(`/company/student/${id}`);

export const getStudentAISummary = (id) => apiFetch(`/company/student/${id}/ai-summary`);

// ===== INTERVIEWS =====
export const sendInterviewRequest = (data) =>
  apiFetch("/interviews", { method: "POST", body: JSON.stringify(data) });

export const getMyInterviews = () => apiFetch("/interviews/my-requests");

export const getCompanyInterviews = (status = "") =>
  apiFetch(`/interviews/company${status ? `?status=${status}` : ""}`);

export const updateInterviewStatus = (id, data) =>
  apiFetch(`/interviews/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const scheduleInterview = (id, data) =>
  apiFetch(`/interviews/${id}/schedule`, { method: "PUT", body: JSON.stringify(data) });

// ===== SHORTLIST =====
export const addToShortlist = (data) =>
  apiFetch("/shortlist", { method: "POST", body: JSON.stringify(data) });

export const removeFromShortlist = (projectId) =>
  apiFetch(`/shortlist/${projectId}`, { method: "DELETE" });

export const getShortlist = () => apiFetch("/shortlist");

export const getStudentShortlists = () => apiFetch("/shortlist/student");

// ===== AI SERVICES =====
export const analyzeResume = (resumeText, jobDescription = "") =>
  apiFetch("/ai/resume", { method: "POST", body: JSON.stringify({ resumeText, jobDescription }) });

export const auditProjectQuality = (projectId) =>
  apiFetch("/ai/project", { method: "POST", body: JSON.stringify({ projectId }) });

export const chatCopilot = (messages) =>
  apiFetch("/ai/copilot", { method: "POST", body: JSON.stringify({ messages }) });

export const gradeInterview = (roleType, topic, answers) =>
  apiFetch("/ai/interview", { method: "POST", body: JSON.stringify({ roleType, topic, answers }) });

export const generateRoadmap = (data) =>
  apiFetch("/ai/roadmap", { method: "POST", body: JSON.stringify(data) });

// ===== PASSWORD RESET =====
export const requestPasswordReset = (email) =>
  apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });

export const resetPassword = (token, password) =>
  apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });