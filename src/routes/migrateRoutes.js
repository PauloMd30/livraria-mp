import express from "express";
import { migrateBooks } from "../controllers/migrateController.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// rota protegida, só admin deveria acessar
router.post("/migrate/books", protectRoute, migrateBooks);

export default router;
