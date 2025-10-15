// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import Converter from "pdf-poppler";
// import { glob } from "glob";
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

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./src/uploads";
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

// Configuração do Multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = "./src/uploads";
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir);
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const fileTypes = /pdf|jpeg|jpg|png/;
//   const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimeType = fileTypes.test(file.mimetype);
//   if (extname && mimeType) cb(null, true);
//   else cb(new Error("Apenas arquivos PDF ou imagens são permitidos."));
// };

// const upload = multer({ storage, fileFilter });

// // ✅ Rota para adicionar um livro
// router.post(
//   "/",
//   protectRoute,
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "pdf", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       if (!req.files || !req.files["pdf"]) {
//         return res.status(400).json({ message: "PDF é obrigatório." });
//       }

//       const { title, caption, rating, type } = req.body;

//       // Agora só exige os campos que realmente são obrigatórios
//       if (!title || !caption || !rating || !type) {
//         return res.status(400).json({
//           message: "Preencha todos os campos obrigatórios.",
//         });
//       }
//       const pdfPath = req.files["pdf"][0].path;

//       let imagePath;

//       if (req.files["image"]) {
//         // Usuário enviou imagem manualmente
//         imagePath = req.files["image"][0].path;
//       } else {
//         // Gerar imagem automaticamente a partir do PDF
//         const outputPath = pdfPath.replace(".pdf", "");
//         const options = {
//           format: "jpeg",
//           out_dir: path.dirname(pdfPath),
//           out_prefix: path.basename(outputPath),
//           page: 1,
//           scale: 1024, // Opcional: define qualidade
//         };

//         await Converter.convert(pdfPath, options);
//         console.log("Conversão concluída:", options);

//         // 🧠 Buscar imagem com glob
//         const pattern = `${options.out_dir}/${options.out_prefix}-*.+(jpg|jpeg)`;
//         const matches = glob.sync(pattern);

//         const foundImage = matches.length > 0 ? matches[0] : null;

//         if (!foundImage) {
//           return res
//             .status(500)
//             .json({ message: "Erro ao gerar imagem da capa do PDF." });
//         }

//         imagePath = foundImage;
//       }
//       const newBook = new Book({
//         title,
//         caption,
//         rating,
//         type,
//         user: req.user._id,
//         file: pdfPath.replace(/\\/g, "/"),
//         image: `${req.protocol}://${req.get("host")}/${imagePath.replace(
//           /\\/g,
//           "/"
//         )}`,

//         currentPage: 0,
//       });

//       await newBook.save();

//       res.status(201).json({
//         message: "Livro adicionado com sucesso!",
//         book: newBook,
//       });
//     } catch (error) {
//       console.error("Erro ao adicionar livro:", error);
//       res
//         .status(500)
//         .json({ message: "Erro ao adicionar livro.", error: error.message });
//     }
//   }
// );

// // ✅ Obter todos os livros (paginado)
// router.get("/", protectRoute, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page || "1");
//     const limit = parseInt(req.query.limit || "5");
//     const skip = (page - 1) * limit;

//     const books = await Book.find()
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate("user", "username profileImage");

//     const totalBooks = await Book.countDocuments();

//     res.status(200).json({
//       books,
//       currentPage: page,
//       totalBooks,
//       totalPages: Math.ceil(totalBooks / limit),
//     });
//   } catch (error) {
//     console.error("Erro ao obter livros:", error);
//     res.status(500).json({ message: "Erro interno do servidor." });
//   }
// });

// router.get("/pdf/:filename", async (req, res) => {
//   try {
//     const filename = req.params.filename;
//     const filePath = path.join("uploads", filename);

//     if (!fs.existsSync(filePath)) {
//       return res.status(404).send("Arquivo não encontrado.");
//     }

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
//     res.sendFile(path.resolve(filePath));
//   } catch (error) {
//     console.error("Erro ao servir PDF:", error);
//     res.status(500).send("Erro interno ao servir o PDF.");
//   }
// });

// // ✅ Obter livros do usuário autenticado
// router.get("/user", protectRoute, async (req, res) => {
//   try {
//     const books = await Book.find({ user: req.user._id }).sort({
//       createdAt: -1,
//     });
//     res.json(books);
//   } catch (error) {
//     console.error("Erro ao obter livros do usuário:", error);
//     res.status(500).json({ message: "Erro interno do servidor." });
//   }
// });

// // ✅ Deletar um livro
// router.delete("/:id", protectRoute, async (req, res) => {
//   try {
//     const book = await Book.findById(req.params.id);

//     if (!book)
//       return res.status(404).json({ message: "Livro não encontrado." });

//     if (book.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Acesso negado." });
//     }

//     await Book.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "Livro deletado com sucesso." });
//   } catch (error) {
//     console.error("Erro ao deletar livro:", error);
//     res.status(500).json({ message: "Erro interno do servidor." });
//   }
// });
