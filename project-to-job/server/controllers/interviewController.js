const Interview = require("../models/Interview");
const mongoose = require("mongoose");
const { sendNotification } = require("../config/socket");

/* ================================
   COMPANY SENDS INTERVIEW REQUEST
================================ */
exports.sendInterviewRequest = async (req, res) => {
  try {
    const { studentId, projectId, message } = req.body;

    if (!studentId || !projectId) {
      return res.status(400).json({ message: "Student ID and Project ID are required." });
    }

    // Idempotent: return existing if already sent
    const existing = await Interview.findOne({
      company: req.user._id,
      project: projectId
    });

    if (existing) {
      return res.status(200).json({
        message: "Interview request already sent.",
        interview: existing
      });
    }

    const interview = await Interview.create({
      company: req.user._id,
      student: studentId,
      project: projectId,
      message: message || "We are interested in your project.",
      status: "pending"
    });

    // Notify student of interview request via WebSockets
    sendNotification(studentId, "INTERVIEW_REQUEST", {
      companyName: req.user.companyName || req.user.name,
      projectId
    });

    // Fetch student & project to send email notification
    const User = require("../models/User");
    const Project = require("../models/Project");
    const { sendInterviewRequestEmail } = require("../services/emailService");

    Promise.all([
      User.findById(studentId),
      Project.findById(projectId)
    ]).then(([student, project]) => {
      if (student && project) {
        sendInterviewRequestEmail(student, req.user, project, message).catch(err =>
          console.error("Error sending interview request email:", err)
        );
      }
    }).catch(err => console.error("Error querying data for interview request email:", err));

    res.status(201).json({
      message: "Interview request sent successfully.",
      interview
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ message: "Interview request already sent." });
    }
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   STUDENT VIEWS THEIR REQUESTS
================================ */
exports.getStudentRequests = async (req, res) => {
  try {
    const requests = await Interview.find({ student: req.user._id })
      .populate("company", "name email companyName industry")
      .populate("project", "title proofScore isVerified techStack")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   STUDENT ACCEPTS / REJECTS
================================ */
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { status, studentNotes } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be accepted or rejected." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid interview ID." });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found." });
    }

    if (interview.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this interview." });
    }

    interview.status = status;
    interview.respondedAt = new Date();
    if (studentNotes) interview.studentNotes = studentNotes;

    await interview.save();

    // Notify company of interview response via WebSockets
    sendNotification(interview.company.toString(), "INTERVIEW_RESPONSE", {
      studentName: req.user.name,
      status
    });

    // Fetch company recruiter to send email notification
    const User = require("../models/User");
    const { sendInterviewResponseEmail } = require("../services/emailService");

    User.findById(interview.company).then(company => {
      if (company) {
        sendInterviewResponseEmail(company, req.user, status, studentNotes).catch(err =>
          console.error("Error sending interview response email:", err)
        );
      }
    }).catch(err => console.error("Error querying data for interview response email:", err));

    res.json({ message: `Interview ${status}.`, interview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   COMPANY VIEWS THEIR INTERVIEWS
================================ */
exports.getCompanyInterviews = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { company: req.user._id };
    if (status) filter.status = status;

    const interviews = await Interview.find(filter)
      .populate("student", "name email college cgpa trustScore trustRank githubUsername")
      .populate("project", "title proofScore isVerified techStack")
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   COMPANY SCHEDULES INTERVIEW
================================ */
exports.scheduleInterview = async (req, res) => {
  try {
    const { scheduledAt, meetingLink, companyNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid interview ID." });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      company: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found or not authorized." });
    }

    if (interview.status !== "accepted") {
      return res.status(400).json({ message: "Can only schedule accepted interviews." });
    }

    interview.status = "scheduled";
    interview.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    interview.meetingLink = meetingLink || "";
    interview.companyNotes = companyNotes || "";

    await interview.save();

    // Notify student of interview scheduled via WebSockets
    sendNotification(interview.student.toString(), "INTERVIEW_SCHEDULED", {
      companyName: req.user.companyName || req.user.name,
      scheduledAt: interview.scheduledAt,
      meetingLink: interview.meetingLink
    });

    // Fetch student & project details for email notification
    const User = require("../models/User");
    const Project = require("../models/Project");
    const { sendInterviewScheduledEmail } = require("../services/emailService");

    Promise.all([
      User.findById(interview.student),
      Project.findById(interview.project)
    ]).then(([student, project]) => {
      if (student && project) {
        sendInterviewScheduledEmail(student, req.user, project, interview.scheduledAt, interview.meetingLink, companyNotes).catch(err =>
          console.error("Error sending interview scheduled email:", err)
        );
      }
    }).catch(err => console.error("Error querying data for interview scheduled email:", err));

    res.json({ message: "Interview scheduled.", interview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};