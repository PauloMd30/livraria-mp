import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import fs from "fs";

import bookRoutes from "./routes/bookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import migrateRoutes from "./routes/migrateRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/admin", migrateRoutes);

const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("Pasta uploads criada automaticamente!");
}

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/book", bookRoutes);

export default app;
