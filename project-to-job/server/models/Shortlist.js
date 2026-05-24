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
    },
    // Optional company note about the candidate
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

shortlistSchema.index({ company: 1, project: 1 }, { unique: true });
shortlistSchema.index({ student: 1 });
shortlistSchema.index({ company: 1 });

module.exports = mongoose.model("Shortlist", shortlistSchema);