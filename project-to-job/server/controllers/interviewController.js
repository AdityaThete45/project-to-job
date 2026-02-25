const Interview = require("../models/Interview");

// Company sends interview request
exports.sendInterviewRequest = async (req, res) => {
  try {
    const { studentId, projectId, message } = req.body;

    const interview = await Interview.create({
      company: req.user._id,
      student: studentId,
      project: projectId,
      message
    });
    
    res.status(201).json({
      message: "Interview request sent",
      interview
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student views their interview requests
exports.getStudentRequests = async (req, res) => {
  try {
    const requests = await Interview.find({ student: req.user._id })
      .populate("company", "name email")
      .populate("project", "title");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student updates interview status
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Ensure only the student can update
    if (interview.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    interview.status = status;
    await interview.save();

    res.json({
      message: `Interview ${status}`,
      interview
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCompanyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      company: req.user._id,
    })
      .populate("student")
      .populate("project");

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};