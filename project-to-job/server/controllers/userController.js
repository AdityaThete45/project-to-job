const Project = require("../models/Project");
const Shortlist = require("../models/Shortlist");
const Interview = require("../models/Interview");
const User = require("../models/User");

exports.getStudentTrustMetrics = async (req, res) => {
  try {
    const studentId = req.params.id;

    // 1️⃣ Validate student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ Get student projects
    const projects = await Project.find({ student: studentId });

    const totalProjects = projects.length;

    // 3️⃣ Average Proof Score
    const totalProofScore = projects.reduce(
      (sum, project) => sum + (project.proofScore || 0),
      0
    );

    const avgProofScore =
      totalProjects > 0
        ? Math.round(totalProofScore / totalProjects)
        : 0;

    // 4️⃣ Verified Projects
    const verifiedProjects = projects.filter(
      (project) => project.isVerified
    ).length;

    // 5️⃣ Shortlists count (student level)
    const totalShortlists = await Shortlist.countDocuments({
      student: studentId
    });

    // 6️⃣ Interviews
    const interviews = await Interview.find({
      student: studentId
    });

    const totalInterviews = interviews.length;

    const acceptedInterviews = interviews.filter(
      (i) => i.status === "accepted"
    ).length;

    const acceptanceRate =
      totalInterviews > 0
        ? Math.round((acceptedInterviews / totalInterviews) * 100)
        : 0;

    res.json({
      totalProjects,
      avgProofScore,
      verifiedProjects,
      totalShortlists,
      totalInterviews,
      acceptanceRate
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};