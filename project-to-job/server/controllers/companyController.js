const Shortlist = require("../models/Shortlist");
const Project = require("../models/Project");

exports.searchStudents = async (req, res) => {
  try {
    const search = req.query.search || "";

    const projects = await Project.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { techStack: { $regex: search, $options: "i" } }
      ]
    })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    // 🔥 Attach shortlist count to each project
    const enhancedProjects = await Promise.all(
      projects.map(async (project) => {
        const count = await Shortlist.countDocuments({
          project: project._id
        });

        return {
          ...project.toObject(),
          shortlistCount: count
        };
      })
    );

    res.json(enhancedProjects);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get single student profile + projects
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password");

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const projects = await Project.find({ student: student._id });

    res.json({
      student,
      projects
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
