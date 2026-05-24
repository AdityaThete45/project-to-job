const User = require("../models/User");
const Project = require("../models/Project");
const Shortlist = require("../models/Shortlist");
const Interview = require("../models/Interview");
const { uploadToCloudinary } = require("../config/cloudinary");
const mongoose = require("mongoose");
const axios = require("axios");

/* =====================================================
   GITHUB DATA FETCH
===================================================== */
const getGitHubRepoData = async (githubLink) => {
  try {
    const parts = githubLink.split("github.com/")[1];
    if (!parts) return null;

    const [owner, repoRaw] = parts.split("/");
    if (!owner || !repoRaw) return null;
    const repo = repoRaw.replace(".git", "").split("/")[0];

    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json"
    };

    const [repoRes, commitsRes, treeRes, languagesRes] = await Promise.allSettled([
      axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, { headers }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, { headers }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers })
    ]);

    return {
      repoMeta: repoRes.status === "fulfilled" ? repoRes.value.data : null,
      commits: commitsRes.status === "fulfilled" ? commitsRes.value.data : [],
      tree: treeRes.status === "fulfilled" ? (treeRes.value.data.tree || []) : [],
      languages: languagesRes.status === "fulfilled" ? languagesRes.value.data : {},
      owner,
      repo
    };
  } catch (err) {
    console.log("GitHub API Error:", err.response?.status, err.message);
    return null;
  }
};

/* =====================================================
   PROOF SCORE CALCULATION
===================================================== */
const calculateProofScore = (project, githubData) => {
  let breakdown = {
    githubDepth: 0,
    commitConsistency: 0,
    repoStructure: 0,
    demoIntegrity: 0,
    technicalExplanation: 0
  };

  let ownershipMismatch = false;
  let githubStats = {
    stars: 0, forks: 0, totalCommits: 0,
    uniqueContributionDays: 0, repoAgeInDays: 0, language: ""
  };

  if (githubData?.repoMeta && project.studentGithubUsername) {
    const repoOwner = githubData.repoMeta.owner.login.toLowerCase();
    if (repoOwner !== project.studentGithubUsername.toLowerCase()) {
      ownershipMismatch = true;
    }
  }

  // Commit Consistency (20)
  if (githubData?.commits?.length && !ownershipMismatch) {
    const realCommits = githubData.commits.filter(c =>
      !c.commit.message.toLowerCase().includes("merge")
    );
    githubStats.totalCommits = realCommits.length;
    const uniqueDays = new Set(
      realCommits.map(c => new Date(c.commit.author.date).toISOString().split("T")[0])
    );
    githubStats.uniqueContributionDays = uniqueDays.size;
    breakdown.commitConsistency += Math.min(10, Math.floor(realCommits.length / 5));
    if (uniqueDays.size >= 5) breakdown.commitConsistency += 5;
    if (uniqueDays.size >= 15) breakdown.commitConsistency += 5;
  }

  // GitHub Depth (25)
  if (githubData?.repoMeta && !ownershipMismatch) {
    const createdAt = new Date(githubData.repoMeta.created_at);
    const updatedAt = new Date(githubData.repoMeta.updated_at);
    const ageInDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
    const lastUpdatedDays = (Date.now() - updatedAt) / (1000 * 60 * 60 * 24);
    githubStats.stars = githubData.repoMeta.stargazers_count || 0;
    githubStats.forks = githubData.repoMeta.forks_count || 0;
    githubStats.repoAgeInDays = Math.round(ageInDays);
    if (ageInDays > 30) breakdown.githubDepth += 5;
    if (ageInDays > 90) breakdown.githubDepth += 5;
    if (lastUpdatedDays < 30) breakdown.githubDepth += 5;
    if (githubData.repoMeta.stargazers_count > 5) breakdown.githubDepth += 5;
    if (githubData.repoMeta.forks_count > 2) breakdown.githubDepth += 5;
  }

  // Repo Structure (20)
  if (githubData?.tree?.length && !ownershipMismatch) {
    const paths = githubData.tree.map(item => item.path.toLowerCase());
    if (paths.some(p => p === "package.json" || p === "requirements.txt" || p === "pom.xml"))
      breakdown.repoStructure += 5;
    if (paths.some(p => p.startsWith("src/"))) breakdown.repoStructure += 5;
    if (paths.some(p => p.includes("component") || p.includes("model") || p.includes("controller")))
      breakdown.repoStructure += 5;
    if (paths.some(p => p.includes("readme"))) breakdown.repoStructure += 5;
    const codeFiles = githubData.tree.filter(f =>
      ["js", "ts", "py", "java", "cpp", "jsx", "tsx", "go", "rs", "php"].some(ext => f.path.toLowerCase().endsWith(`.${ext}`))
    );
    if (codeFiles.length > 10) breakdown.repoStructure += 5;
  }

  // Demo Integrity (15)
  if (project.videoLink) breakdown.demoIntegrity += 5;
  if (project.demoLink) breakdown.demoIntegrity += 5;
  if (project.role) breakdown.demoIntegrity += 5;

  // Technical Explanation (20)
  if (project.description?.length > 200) breakdown.technicalExplanation += 10;
  else if (project.description?.length > 100) breakdown.technicalExplanation += 5;
  if (project.role) breakdown.technicalExplanation += 5;
  if (project.techStack?.length >= 3) breakdown.technicalExplanation += 5;

  // Ownership penalty
  if (ownershipMismatch) {
    breakdown.githubDepth = 0;
    breakdown.commitConsistency = 0;
    breakdown.repoStructure = 0;
  }

  // Cap scores
  breakdown.githubDepth = Math.min(25, breakdown.githubDepth);
  breakdown.commitConsistency = Math.min(20, breakdown.commitConsistency);
  breakdown.repoStructure = Math.min(20, breakdown.repoStructure);
  breakdown.demoIntegrity = Math.min(15, breakdown.demoIntegrity);
  breakdown.technicalExplanation = Math.min(20, breakdown.technicalExplanation);

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const isVerified = !ownershipMismatch &&
    breakdown.commitConsistency >= 12 &&
    breakdown.githubDepth >= 10 &&
    breakdown.repoStructure >= 10;

  // AI Insights
  let commitQuality = "";
  let repoMaturity = "";
  let recommendation = "";

  if (ownershipMismatch) {
    commitQuality = "Repository ownership could not be verified. Scores reduced.";
  } else if (breakdown.commitConsistency >= 15) {
    commitQuality = "Excellent commit history — shows sustained development effort.";
  } else if (breakdown.commitConsistency >= 8) {
    commitQuality = "Decent commit activity. More consistent contributions would help.";
  } else {
    commitQuality = "Limited commit history. Project may have been uploaded recently.";
  }

  if (githubStats.repoAgeInDays > 90) {
    repoMaturity = `Mature repository (${githubStats.repoAgeInDays} days old). Demonstrates long-term ownership.`;
  } else if (githubStats.repoAgeInDays > 30) {
    repoMaturity = `Established repository (${githubStats.repoAgeInDays} days old).`;
  } else {
    repoMaturity = `Recently created repository (${githubStats.repoAgeInDays} days old).`;
  }

  if (total >= 75) recommendation = "High confidence in project authenticity. Strong candidate for technical roles.";
  else if (total >= 50) recommendation = "Moderate confidence. Could be strengthened with more commit history.";
  else recommendation = "Low confidence score. Recommend deeper technical screening.";

  const aiInsights = {
    ownershipVerified: !ownershipMismatch,
    commitQuality,
    repoMaturity,
    recommendation
  };

  if (githubData?.languages) {
    githubStats.language = Object.keys(githubData.languages)[0] || "";
  }

  return { total, breakdown, isVerified, aiInsights, githubStats };
};

/* =====================================================
   UPDATE STUDENT TRUST SCORE
===================================================== */
const updateStudentTrustScore = async (studentId) => {
  try {
    const projects = await Project.find({ student: studentId });
    if (!projects.length) return;
    const avg = Math.round(projects.reduce((s, p) => s + (p.proofScore || 0), 0) / projects.length);
    let trustRank = "Unranked";
    if (avg >= 80) trustRank = "Elite";
    else if (avg >= 65) trustRank = "Verified";
    else if (avg >= 40) trustRank = "Rising";
    await User.findByIdAndUpdate(studentId, { trustScore: avg, trustRank });
  } catch (err) {
    console.error("Trust score update error:", err);
  }
};

/* =====================================================
   CREATE PROJECT
===================================================== */
exports.createProject = async (req, res) => {
  try {
    const { title, githubLink, demoLink, techStack, role, description } = req.body;

    // Validations first (before any upload)
    if (!req.file) {
      return res.status(400).json({ message: "Project explanation video is required." });
    }
    if (!title?.trim()) {
      return res.status(400).json({ message: "Project title is required." });
    }
    if (!githubLink?.trim()) {
      return res.status(400).json({ message: "GitHub link is required." });
    }

    // Upload video from buffer (works with multer memoryStorage v2)
    let videoUrl = "";
    try {
      const result = await uploadToCloudinary(req.file.buffer, {
        resource_type: "video",
        folder: "p2j_videos",
        timeout: 120000
      });
      videoUrl = result.secure_url;
    } catch (uploadErr) {
      console.error("Cloudinary upload error:", uploadErr);
      return res.status(500).json({ message: "Video upload failed. Please try again." });
    }

    const student = await User.findById(req.user._id);

    // Parse techStack
    let parsedTechStack = [];
    try {
      parsedTechStack = typeof techStack === "string" ? JSON.parse(techStack) : techStack;
    } catch {
      parsedTechStack = techStack ? techStack.split(",").map(t => t.trim()).filter(Boolean) : [];
    }

    const projectData = {
      student: req.user._id,
      title: title.trim(),
      githubLink: githubLink.trim(),
      demoLink: demoLink?.trim() || "",
      videoLink: videoUrl,
      techStack: parsedTechStack,
      role: role?.trim() || "",
      description: description?.trim() || "",
      studentGithubUsername: student.githubUsername
    };

    // Run GitHub analysis (non-blocking — if it fails, project still saves)
    const githubData = await getGitHubRepoData(githubLink);
    const { total, breakdown, isVerified, aiInsights, githubStats } = calculateProofScore(projectData, githubData);

    projectData.proofScore = total;
    projectData.proofBreakdown = breakdown;
    projectData.isVerified = isVerified;
    projectData.aiInsights = aiInsights;
    projectData.githubStats = githubStats;

    const project = await Project.create(projectData);

    // Update cached trust score
    await updateStudentTrustScore(req.user._id);

    res.status(201).json({
      message: "Project uploaded successfully.",
      project
    });

  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    res.status(500).json({ message: error.message || "Server error during project upload." });
  }
};

/* =====================================================
   GET MY PROJECTS
===================================================== */
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET STUDENT PROJECTS (company view)
===================================================== */
exports.getStudentProjects = async (req, res) => {
  try {
    const projects = await Project.find({ student: req.params.studentId }).sort({ proofScore: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET PROJECT BY ID
===================================================== */
exports.getProjectById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid project ID." });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate("student", "name email college cgpa skills graduationYear githubUsername bio linkedin trustScore trustRank");

    if (!project) return res.status(404).json({ message: "Project not found." });

    const companyInterestCount = await Shortlist.countDocuments({ project: project._id });
    res.json({ ...project.toObject(), companyInterestCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET PROJECT ACTION STATUS
===================================================== */
exports.getProjectActionStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
      return res.status(400).json({ message: "Invalid project ID." });
    }

    const projectId = new mongoose.Types.ObjectId(req.params.projectId);
    const [shortlisted, interview] = await Promise.all([
      Shortlist.findOne({ company: req.user._id, project: projectId }),
      Interview.findOne({ company: req.user._id, project: projectId })
    ]);

    res.json({
      shortlisted: !!shortlisted,
      interviewRequested: !!interview,
      interviewStatus: interview?.status || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   DELETE PROJECT
===================================================== */
exports.deleteProject = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid project ID." });
    }

    const project = await Project.findOne({ _id: req.params.id, student: req.user._id });
    if (!project) return res.status(404).json({ message: "Project not found or not authorized." });

    await Project.findByIdAndDelete(req.params.id);
    await updateStudentTrustScore(req.user._id);

    res.json({ message: "Project deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};