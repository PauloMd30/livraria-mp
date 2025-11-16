import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import {
  getBooks,
  addBook,
  getUserBooks,
  getPdf,
  filterBooks,
  deleteBook,
} from "../controllers/bookControllers.js";

import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /pdf|jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (extname && mimeType) cb(null, true);
  else cb(new Error("Apenas arquivos PDF ou imagens são permitidos."));
};

const upload = multer({ storage, fileFilter });

// Rotas públicas
router.get("/pdf/:filename", getPdf);
router.get("/filter", filterBooks);

// Rotas protegidas
router.get("/", protectRoute, getBooks);
router.post(
  "/",
  protectRoute,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  addBook
);
router.get("/user", protectRoute, getUserBooks);
router.delete("/:id", protectRoute, deleteBook);

export default router;
