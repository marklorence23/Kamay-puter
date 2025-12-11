import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import uploadRoute from "./api/upload.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------------------------------
// Ensure uploads folder exists
// -----------------------------------------------------
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
  console.log("📂 Created uploads/ folder");
}

// -----------------------------------------------------
// Middlewares
// -----------------------------------------------------
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// -----------------------------------------------------
// API Routes
// -----------------------------------------------------
app.post("/api/upload", uploadRoute);

// -----------------------------------------------------
// Frontend Routes
// -----------------------------------------------------
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/home", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/analytics", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "analytics.html"));
});
app.get("/information", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "information.html"));
});

// -----------------------------------------------------
// Start Server
// -----------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
