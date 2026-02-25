const Shortlist = require("../models/Shortlist");

/*
  Add student to shortlist
  Hybrid Model:
  - One company can shortlist one student only once
  - Store which project triggered shortlist
*/
exports.addToShortlist = async (req, res) => {
  try {
    const { studentId, projectId } = req.body;

    if (!studentId || !projectId) {
      return res.status(400).json({
        message: "Student ID and Project ID are required."
      });
    }

    // 🔎 Check if already shortlisted
    const existing = await Shortlist.findOne({
  company: req.user._id,
  project: projectId
});

    if (existing) {
      return res.status(400).json({
        message: "Student already shortlisted."
      });
    }

    const shortlist = await Shortlist.create({
      company: req.user._id,
      student: studentId,
      project: projectId
    });

    res.status(201).json({
      message: "Student shortlisted successfully.",
      shortlist
    });

  } catch (error) {
    console.error("SHORTLIST ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


/*
  Get company shortlist
  Fully populate student and project
*/
exports.getShortlist = async (req, res) => {
  try {
    const list = await Shortlist.find({
      company: req.user._id
    })
      .populate("student", "name email")
      .populate({
        path: "project",
        populate: {
          path: "student",
          select: "name email"
        }
      })
      .sort({ createdAt: -1 });

    res.json(list);

  } catch (error) {
    console.error("GET SHORTLIST ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentShortlists = async (req, res) => {
  try {
    const list = await Shortlist.find({
      student: req.user._id
    })
      .populate("company", "name email")
      .populate("project", "title")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (error) {
    console.error("STUDENT SHORTLIST ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};