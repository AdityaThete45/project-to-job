const mongoose = require("mongoose");

const shortlistSchema = new mongoose.Schema(
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
    }
  },
  { timestamps: true }
);

// 🔒 Prevent duplicate shortlist per student per company
shortlistSchema.index(
  { company: 1, project: 1 },
  { unique: true }
);
module.exports = mongoose.model("Shortlist", shortlistSchema);