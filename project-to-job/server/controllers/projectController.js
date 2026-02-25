const User = require("../models/User");
const Project = require("../models/Project");
const Shortlist = require("../models/Shortlist");
const Interview = require("../models/Interview");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const mongoose = require("mongoose");
const axios = require("axios");

/* =====================================================
   🔥 PHASE 3.4 — OWNERSHIP VERIFIED GITHUB PROOF ENGINE
===================================================== */

/* ================= GITHUB DATA FETCH ================= */
const getGitHubRepoData = async (githubLink) => {
  try {
    const parts = githubLink.split("github.com/")[1];
    if (!parts) return null;

    const [owner, repoRaw] = parts.split("/");
    if (!owner || !repoRaw) return null;

    const repo = repoRaw.replace(".git", "").replace("/", "");

    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json"
    };

    const repoRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    const contributorsRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contributors`,
      { headers }
    );

    const commitsRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
      { headers }
    );

    const treeRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoRes.data.default_branch}?recursive=1`,
      { headers }
    );

    return {
      repoMeta: repoRes.data,
      contributors: contributorsRes.data,
      commits: commitsRes.data,
      tree: treeRes.data.tree
    };

  } catch (err) {
    console.log("GitHub API Error:", err.response?.status);
    return null;
  }
};

/* ================= PROOF SCORE CALCULATION ================= */
const calculateProofScore = (project, githubData) => {

  let breakdown = {
    githubDepth: 0,
    commitConsistency: 0,
    repoStructure: 0,
    demoIntegrity: 0,
    technicalExplanation: 0
  };

  /* ---------- OWNERSHIP CHECK ---------- */
  let ownershipMismatch = false;

  if (githubData && project.studentGithubUsername) {
    const repoOwner =
      githubData.repoMeta.owner.login.toLowerCase();

    if (
      repoOwner !==
      project.studentGithubUsername.toLowerCase()
    ) {
      ownershipMismatch = true;
    }
  }

  /* ---------- COMMIT CONSISTENCY (20) ---------- */
  if (githubData && githubData.commits && !ownershipMismatch) {

    const realCommits = githubData.commits.filter(c =>
      !c.commit.message.toLowerCase().includes("merge")
    );

    const totalCommits = realCommits.length;

    const uniqueDays = new Set(
      realCommits.map(c =>
        new Date(c.commit.author.date)
          .toISOString()
          .split("T")[0]
      )
    );

    breakdown.commitConsistency +=
      Math.min(10, Math.floor(totalCommits / 5));

    if (uniqueDays.size >= 5)
      breakdown.commitConsistency += 5;

    if (uniqueDays.size >= 15)
      breakdown.commitConsistency += 5;
  }

  /* ---------- GITHUB DEPTH (25) ---------- */
  if (githubData && !ownershipMismatch) {

    const createdAt =
      new Date(githubData.repoMeta.created_at);

    const updatedAt =
      new Date(githubData.repoMeta.updated_at);

    const ageInDays =
      (Date.now() - createdAt) /
      (1000 * 60 * 60 * 24);

    if (ageInDays > 30)
      breakdown.githubDepth += 5;

    if (ageInDays > 90)
      breakdown.githubDepth += 5;

    const lastUpdatedDays =
      (Date.now() - updatedAt) /
      (1000 * 60 * 60 * 24);

    if (lastUpdatedDays < 30)
      breakdown.githubDepth += 5;

    if (githubData.repoMeta.stargazers_count > 5)
      breakdown.githubDepth += 5;

    if (githubData.repoMeta.forks_count > 2)
      breakdown.githubDepth += 5;
  }

  /* ---------- REPO STRUCTURE (20) ---------- */
  if (githubData && githubData.tree && !ownershipMismatch) {

    const paths =
      githubData.tree.map(item =>
        item.path.toLowerCase()
      );

    if (paths.includes("package.json"))
      breakdown.repoStructure += 5;

    if (paths.some(p => p.startsWith("src/")))
      breakdown.repoStructure += 5;

    if (paths.some(p => p.includes("components")))
      breakdown.repoStructure += 5;

    if (paths.some(p => p.includes("readme")))
      breakdown.repoStructure += 5;

    const codeFiles =
      githubData.tree.filter(file =>
        ["js","ts","py","java","cpp","jsx","tsx"]
          .some(ext =>
            file.path
              .toLowerCase()
              .endsWith(`.${ext}`)
          )
      );

    if (codeFiles.length > 10)
      breakdown.repoStructure += 5;
  }

  /* ---------- DEMO INTEGRITY (15) ---------- */
  if (project.videoLink)
    breakdown.demoIntegrity += 5;

  if (project.demoLink)
    breakdown.demoIntegrity += 5;

  if (project.role)
    breakdown.demoIntegrity += 5;

  /* ---------- TECHNICAL EXPLANATION (20) ---------- */
  if (project.description?.length > 200)
    breakdown.technicalExplanation += 10;

  if (project.role)
    breakdown.technicalExplanation += 5;

  /* ---------- OWNERSHIP PENALTY ---------- */
  if (ownershipMismatch) {
    breakdown.githubDepth = 0;
    breakdown.commitConsistency = 0;
    breakdown.repoStructure = 0;
  }

  /* ---------- CAP SCORES ---------- */
  breakdown.githubDepth = Math.min(25, breakdown.githubDepth);
  breakdown.commitConsistency = Math.min(20, breakdown.commitConsistency);
  breakdown.repoStructure = Math.min(20, breakdown.repoStructure);
  breakdown.demoIntegrity = Math.min(15, breakdown.demoIntegrity);
  breakdown.technicalExplanation = Math.min(20, breakdown.technicalExplanation);

  const total =
    breakdown.githubDepth +
    breakdown.commitConsistency +
    breakdown.repoStructure +
    breakdown.demoIntegrity +
    breakdown.technicalExplanation;

  /* ---------- VERIFIED BADGE LOGIC ---------- */
  let isVerified = false;

  if (
    !ownershipMismatch &&
    breakdown.commitConsistency >= 12 &&
    breakdown.githubDepth >= 10 &&
    breakdown.repoStructure >= 10
  ) {
    isVerified = true;
  }

  return { total, breakdown, isVerified };
};

/* =====================================================
   📌 CREATE PROJECT
===================================================== */

exports.createProject = async (req, res) => {
  try {

    const {
      title,
      githubLink,
      demoLink,
      techStack,
      role,
      description
    } = req.body;

    let videoUrl = "";

    if (req.file) {
      const result =
        await cloudinary.uploader.upload(
          req.file.path,
          {
            resource_type: "video",
            folder: "p2j_videos"
          }
        );

      videoUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    if (!req.file)
      return res.status(400).json({ message: "Video required." });

    if (!githubLink)
      return res.status(400).json({ message: "GitHub link required." });

    const student =
      await User.findById(req.user._id);

    const projectData = {
      student: req.user._id,
      title,
      githubLink,
      demoLink,
      videoLink: videoUrl,
      techStack: JSON.parse(techStack),
      role,
      description,
      studentGithubUsername:
        student.githubUsername
    };

    const githubData =
      await getGitHubRepoData(githubLink);

    const { total, breakdown, isVerified } =
      calculateProofScore(
        projectData,
        githubData
      );

    projectData.proofScore = total;
    projectData.proofBreakdown = breakdown;
    projectData.isVerified = isVerified;

    const project =
      await Project.create(projectData);

    res.status(201).json({
      message: "Project uploaded successfully",
      project
    });

  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   OTHER ROUTES
===================================================== */

exports.getMyProjects = async (req, res) => {
  const projects =
    await Project.find({ student: req.user._id });
  res.json(projects);
};

exports.getStudentProjects = async (req, res) => {
  const projects =
    await Project.find({ student: req.params.studentId });
  res.json(projects);
};

exports.getProjectById = async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const project =
    await Project.findById(req.params.id)
      .populate(
        "student",
        "name email college cgpa skills graduationYear githubUsername"
      );

  if (!project)
    return res.status(404).json({ message: "Project not found" });

  res.json(project);
};

exports.getProjectActionStatus = async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
    return res.status(400).json({ message: "Invalid project ID" });
  }

  const projectObjectId =
    new mongoose.Types.ObjectId(req.params.projectId);

  const shortlisted =
    await Shortlist.findOne({
      company: req.user._id,
      project: projectObjectId
    });

  const interview =
    await Interview.findOne({
      company: req.user._id,
      project: projectObjectId
    });

  res.json({
    shortlisted: !!shortlisted,
    interviewRequested: !!interview
  });
};