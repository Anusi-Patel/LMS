import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/error.js";

// Route files
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import progressRoutes from "./routes/progress.js";
import certificateRoutes from "./routes/certificates.js";
import discussionRoutes from "./routes/discussions.js";
import announcementRoutes from "./routes/announcements.js";

// Load env vars
dotenv.config();

// Connect to database
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected Successfully");

    const app = express();

    // Body parser
    app.use(express.json());

    // Enable CORS
    app.use(cors());

    // Set static folder
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    // Mount routers
    app.use("/api/auth", authRoutes);
    app.use("/api/courses", courseRoutes);
    app.use("/api/progress", progressRoutes);
    app.use("/api/certificates", certificateRoutes);
    app.use("/api/discussions", discussionRoutes);
    app.use("/api/announcements", announcementRoutes);

    // Error handler middleware
    app.use(errorHandler);

    const PORT = process.env.PORT || 5001;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error(`❌ Uncaught Exception: ${err.message}`);
      process.exit(1);
    });
  } catch (error) {
    console.error(`❌ Server Startup Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();