const Shortlist = require("../models/Shortlist");
const mongoose = require("mongoose");

/* =====================================================
   ADD TO SHORTLIST
===================================================== */
exports.addToShortlist = async (req, res) => {
  try {
    const { studentId, projectId, note } = req.body;

    if (!studentId || !projectId) {
      return res.status(400).json({ message: "Student ID and Project ID are required." });
    }

    const existing = await Shortlist.findOne({
      company: req.user._id,
      project: projectId
    });

    if (existing) {
      return res.status(200).json({ message: "Already shortlisted.", shortlist: existing });
    }

    const shortlist = await Shortlist.create({
      company: req.user._id,
      student: studentId,
      project: projectId,
      note: note || ""
    });

    res.status(201).json({ message: "Candidate shortlisted successfully.", shortlist });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ message: "Already shortlisted." });
    }
    console.error("SHORTLIST ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   REMOVE FROM SHORTLIST
===================================================== */
exports.removeFromShortlist = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID." });
    }

    await Shortlist.findOneAndDelete({
      company: req.user._id,
      project: projectId
    });

    res.json({ message: "Removed from shortlist." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET COMPANY SHORTLIST
===================================================== */
exports.getShortlist = async (req, res) => {
  try {
    const list = await Shortlist.find({ company: req.user._id })
      .populate("student", "name email college cgpa trustScore trustRank")
      .populate({
        path: "project",
        populate: { path: "student", select: "name email" }
      })
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (error) {
    console.error("GET SHORTLIST ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET STUDENT'S SHORTLISTS (student view)
===================================================== */
exports.getStudentShortlists = async (req, res) => {
  try {
    const list = await Shortlist.find({ student: req.user._id })
      .populate("company", "name email companyName industry")
      .populate("project", "title proofScore")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (error) {
    console.error("STUDENT SHORTLIST ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};