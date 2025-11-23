import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import fs from "fs";

import bookRoutes from "./routes/bookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import migrateRoutes from "./routes/migrateRoutes.js";
import adminMiddleware from "./middleware/admin.middleware.js";

const app = express();

app.use(express.json());
app.use("/pdfjs", express.static(path.join(process.cwd(), "public/pdfjs")));
app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// SERVIR UPLOADS (PDF inline + imagens normais)
app.use(
  "/uploads",
  (req, res, next) => {
    const file = req.path.toLowerCase();

    if (file.endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
    }

    next();
  },
  express.static(path.join(process.cwd(), "uploads"))
);

app.use("/api/admin", adminMiddleware, migrateRoutes);

const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("Pasta uploads criada automaticamente!");
}

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/book", bookRoutes);

export default app;
