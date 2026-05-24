const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "scheduled"],
      default: "pending"
    },
    respondedAt: { type: Date },
    studentNotes: { type: String, default: "" },
    scheduledAt: { type: Date },
    meetingLink: { type: String, default: "" },
    companyNotes: { type: String, default: "" }
  },
  { timestamps: true }
);

interviewSchema.index({ company: 1, project: 1 }, { unique: true });
interviewSchema.index({ student: 1 });
interviewSchema.index({ company: 1 });

module.exports = mongoose.model("Interview", interviewSchema);