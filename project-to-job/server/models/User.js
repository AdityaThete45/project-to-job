const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "company"], required: true },

    // GitHub (required for students)
    githubUsername: {
      type: String,
      required: function () { return this.role === "student"; },
      trim: true
    },

    // Student Fields
    college: { type: String, default: "" },
    branch: { type: String, default: "" },
    cgpa: { type: Number, default: null },
    graduationYear: { type: Number, default: null },
    skills: { type: [String], default: [] },

    // Student Profile Extras
    bio: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    avatar: { type: String, default: "" },  // Cloudinary URL

    // Company Fields
    companyName: { type: String, default: "" },
    industry: { type: String, default: "" },
    companySize: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    companyDescription: { type: String, default: "" },

    // Cached Trust Score (updated on project add/update)
    trustScore: { type: Number, default: 0 },
    trustRank: { type: String, default: "Unranked" }, // Unranked / Rising / Verified / Elite

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Safe public profile (no password)
userSchema.methods.toPublicProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
