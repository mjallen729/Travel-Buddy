import "./appConfig.js"; // dotenv loads from here (imports are processed first)
import express from "express";
import connectDB from "./config/database.js";
import logger from "./utils/logger.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize mongo
connectDB();

// Middleware
app.use(express.json());

// Serve the frontend statically so everything is same-origin (no CORS needed)
const frontendDir = path.join(__dirname, "../frontend");
app.use(express.static(frontendDir));

// Routes
import tripRoutes from "./Routes/trips.js";
import userRoutes from "./Routes/users.js";
import collabRoutes from "./Routes/collaboration.js";
import preferenceRoutes from "./Routes/preferences.js";

// Health check
app.get("/api/ping", (_req, res) => {
  logger.info("✅ Ping received from frontend");
  res.json({ message: "Backend is alive!" });
});

// Route bindings (MUST come before fallback route)

app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);
app.use("/api/collaboration", collabRoutes);
app.use("/api/preferences", preferenceRoutes);

// Fallback unmatched route (serve frontend for non-API paths)
app.use((req, res) => {
  if (!req.path.startsWith("/api")) {
    return res.sendFile(path.join(frontendDir, "index.html"));
  }
  res.status(404).json({ error: "Not found!" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  logger.error("❌ Global error", { error: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal server error" });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`🚀 Backend listening on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});
