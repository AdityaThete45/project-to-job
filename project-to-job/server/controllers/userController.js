const Project = require("../models/Project");
const Shortlist = require("../models/Shortlist");
const Interview = require("../models/Interview");
const User = require("../models/User");

/* =====================================================
   GET STUDENT TRUST METRICS
===================================================== */
exports.getStudentTrustMetrics = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found." });
    }

    const projects = await Project.find({ student: studentId });
    const totalProjects = projects.length;
    const totalProofScore = projects.reduce((sum, p) => sum + (p.proofScore || 0), 0);
    const avgProofScore = totalProjects > 0 ? Math.round(totalProofScore / totalProjects) : 0;
    const verifiedProjects = projects.filter(p => p.isVerified).length;

    const [totalShortlists, interviews] = await Promise.all([
      Shortlist.countDocuments({ student: studentId }),
      Interview.find({ student: studentId })
    ]);

    const totalInterviews = interviews.length;
    const acceptedInterviews = interviews.filter(i => i.status === "accepted" || i.status === "scheduled").length;
    const acceptanceRate = totalInterviews > 0
      ? Math.round((acceptedInterviews / totalInterviews) * 100)
      : 0;

    // Trust Rank
    let trustRank = "Unranked";
    if (avgProofScore >= 80 && verifiedProjects >= 2) trustRank = "Elite";
    else if (avgProofScore >= 65) trustRank = "Verified";
    else if (avgProofScore >= 40) trustRank = "Rising";

    res.json({
      totalProjects,
      avgProofScore,
      verifiedProjects,
      totalShortlists,
      totalInterviews,
      acceptedInterviews,
      acceptanceRate,
      trustRank
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET OWN PROFILE (student/company)
===================================================== */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   UPDATE PROFILE
===================================================== */
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "bio", "linkedin", "portfolio", "college", "branch", "cgpa", "graduationYear", "skills", "githubUsername", "companyName", "industry", "companySize", "companyWebsite", "companyDescription"];

    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle skills as array
    if (typeof updates.skills === "string") {
      updates.skills = updates.skills.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (updates.cgpa) updates.cgpa = Number(updates.cgpa);
    if (updates.graduationYear) updates.graduationYear = Number(updates.graduationYear);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Profile updated.", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};