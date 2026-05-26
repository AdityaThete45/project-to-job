require("dotenv").config();
require("./services/emailService");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./config/socket");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const companyRoutes = require("./routes/companyRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const shortlistRoutes = require("./routes/shortlistRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// ===== Security & Middleware =====
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/shortlist", shortlistRoutes);
app.use("/api/ai", aiRoutes);

// ===== Health Check =====
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Project-to-Job API is running" });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ===== Database Connection & Server Startup =====
const server = http.createServer(app);
initSocket(server);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} with WebSockets enabled`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
