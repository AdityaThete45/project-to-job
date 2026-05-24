const User = require("../models/User");
const Project = require("../models/Project");
const Shortlist = require("../models/Shortlist");
const Interview = require("../models/Interview");

/* =====================================================
   SEARCH STUDENTS / PROJECTS (with smart ranking)
===================================================== */
exports.searchStudents = async (req, res) => {
  try {
    const { search = "", minScore = 0, techStack = "", verified = "" } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { techStack: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (minScore) {
      query.proofScore = { $gte: Number(minScore) };
    }

    if (techStack) {
      query.techStack = { $in: [new RegExp(techStack, "i")] };
    }

    if (verified === "true") {
      query.isVerified = true;
    }

    const projects = await Project.find(query)
      .populate("student", "name email college cgpa trustScore trustRank githubUsername")
      .sort({ proofScore: -1, createdAt: -1 })
      .limit(100);

    // Attach shortlist count to each project
    const enhanced = await Promise.all(
      projects.map(async (project) => {
        const shortlistCount = await Shortlist.countDocuments({ project: project._id });
        return { ...project.toObject(), shortlistCount };
      })
    );

    res.json(enhanced);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET STUDENT PROFILE (company view)
   FIX: was missing User import
===================================================== */
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password");

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found." });
    }

    const projects = await Project.find({ student: student._id }).sort({ proofScore: -1 });

    const shortlistCount = await Shortlist.countDocuments({ student: student._id });
    const interviewCount = await Interview.countDocuments({ student: student._id });

    res.json({ student, projects, shortlistCount, interviewCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET COMPANY DASHBOARD STATS
===================================================== */
exports.getCompanyStats = async (req, res) => {
  try {
    const [totalProjects, shortlistCount, interviewCount, pendingCount, acceptedCount] = await Promise.all([
      Project.countDocuments(),
      Shortlist.countDocuments({ company: req.user._id }),
      Interview.countDocuments({ company: req.user._id }),
      Interview.countDocuments({ company: req.user._id, status: "pending" }),
      Interview.countDocuments({ company: req.user._id, status: "accepted" })
    ]);

    res.json({
      totalProjects,
      shortlistCount,
      interviewCount,
      pendingCount,
      acceptedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET TOP CANDIDATES (trust-ranked)
===================================================== */
exports.getTopCandidates = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topStudents = await User.find({ role: "student" })
      .sort({ trustScore: -1 })
      .limit(Number(limit))
      .select("-password");

    const enriched = await Promise.all(
      topStudents.map(async (student) => {
        const verifiedCount = await Project.countDocuments({ student: student._id, isVerified: true });
        const totalProjects = await Project.countDocuments({ student: student._id });
        return { ...student.toObject(), verifiedProjects: verifiedCount, totalProjects };
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};