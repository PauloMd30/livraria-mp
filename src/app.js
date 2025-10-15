import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";

import bookRoutes from "./routes/bookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import migrateRoutes from "./routes/migrateRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/admin", migrateRoutes);
app.use(
  "/src/uploads",
  express.static(path.join(process.cwd(), "src/uploads"))
);

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/book", bookRoutes);

export default app;
