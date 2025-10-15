// // import multer from "multer";
// import path from "path";
// import fs from "fs";
// import Converter from "pdf-poppler";
// import { glob } from "glob";
// import Book from "../models/book.js";

// // funçao para buscar todos os livros
// export const getBooks = async (req, res) => {
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
// };

// // Funçao para adicionar um livro
// export const addBook = async (req, res) => {
//   try {
//     if (!req.files || !req.files["pdf"]) {
//       return res.status(400).json({ message: "PDF é obrigatório." });
//     }

//     const { title, caption, rating, type } = req.body;

//     // Agora só exige os campos que realmente são obrigatórios
//     if (!title || !caption || !rating || !type) {
//       return res.status(400).json({
//         message: "Preencha todos os campos obrigatórios.",
//       });
//     }
//     const pdfPath = req.files["pdf"][0].path;

//     let imagePath;

//     if (req.files["image"]) {
//       // Usuário enviou imagem manualmente
//       imagePath = req.files["image"][0].path;
//     } else {
//       // Gerar imagem automaticamente a partir do PDF
//       const outputPath = pdfPath.replace(".pdf", "");
//       const options = {
//         format: "jpeg",
//         out_dir: path.dirname(pdfPath),
//         out_prefix: path.basename(outputPath),
//         page: 1,
//         scale: 1024, // Opcional: define qualidade
//       };

//       await Converter.convert(pdfPath, options);
//       console.log("Conversão concluída:", options);

//       // Buscar imagem com glob
//       const pattern = path
//         .join(options.out_dir, `${options.out_prefix}-*.+(jpg|jpeg)`)
//         .replace(/\\/g, "/");

//       console.log("🔎 Procurando imagem com padrão:", pattern);

//       const matches = glob.sync(pattern);

//       const foundImage = matches.length > 0 ? matches[0] : null;

//       if (!foundImage) {
//         return res
//           .status(500)
//           .json({ message: "Erro ao gerar imagem da capa do PDF." });
//       }

//       imagePath = foundImage;
//     }
//     const newBook = new Book({
//       title,
//       caption,
//       rating,
//       type,
//       user: req.user._id,
//       file: http://192.168.1.101:3000/src/uploads/arquivo.pdf,
//       image: `${req.protocol}://${req.get("host")}/${imagePath.replace(
//         /\\/g,
//         "/"
//       )}`,

//       currentPage: 0,
//     });

//     await newBook.save();

//     res.status(201).json({
//       message: "Livro adicionado com sucesso!",
//       book: newBook,
//     });
//   } catch (error) {
//     console.error("Erro ao adicionar livro:", error);
//     res
//       .status(500)
//       .json({ message: "Erro ao adicionar livro.", error: error.message });
//   }
// };

// // Funçao para obter livros do usuário autenticado
// export const getUserBooks = async (req, res) => {
//   try {
//     const books = await Book.find({ user: req.user._id }).sort({
//       createdAt: -1,
//     });
//     res.json(books);
//   } catch (error) {
//     console.error("Erro ao obter livros do usuário:", error);
//     res.status(500).json({ message: "Erro interno do servidor." });
//   }
// };

// export const getPdf = async (req, res) => {
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
// };

// // Funçao para deletar um livro
// export const deleteBook = async (req, res) => {
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
// };

// export default {
//   getBooks,
//   addBook,
//   getUserBooks,
//   getPdf,
//   deleteBook,
// };

import path from "path";
import fs from "fs";
import Converter from "pdf-poppler";
import { glob } from "glob";
import Book from "../models/book.js";

// 🔧 helper para normalizar URLs
const buildFileUrl = (req, filePath) => {
  if (!filePath) return null;
  // já é uma URL completa? retorna direto
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  return `${req.protocol}://${req.get("host")}/${filePath.replace(/\\/g, "/")}`;
};

// Função para buscar todos os livros (paginado)
export const getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "5");
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    // 🔧 normalizar URLs antes de enviar ao frontend
    const booksWithUrls = books.map((book) => ({
      ...book.toObject(),
      file: buildFileUrl(req, book.file),
      image: buildFileUrl(req, book.image),
    }));

    res.status(200).json({
      books: booksWithUrls,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.error("Erro ao obter livros:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Função para adicionar um livro
export const addBook = async (req, res) => {
  try {
    if (!req.files || !req.files["pdf"]) {
      return res.status(400).json({ message: "PDF é obrigatório." });
    }

    const { title, caption, rating, type } = req.body;

    if (!title || !caption || !rating || !type) {
      return res.status(400).json({
        message: "Preencha todos os campos obrigatórios.",
      });
    }

    const pdfPath = req.files["pdf"][0].path;
    let imagePath;

    if (req.files["image"]) {
      imagePath = req.files["image"][0].path;
    } else {
      const outputPath = pdfPath.replace(".pdf", "");
      const options = {
        format: "jpeg",
        out_dir: path.dirname(pdfPath),
        out_prefix: path.basename(outputPath),
        page: 1,
        scale: 1024,
      };

      await Converter.convert(pdfPath, options);
      console.log("Conversão concluída:", options);

      const pattern = path
        .join(options.out_dir, `${options.out_prefix}-*.+(jpg|jpeg)`)
        .replace(/\\/g, "/");

      console.log("🔎 Procurando imagem com padrão:", pattern);

      const matches = glob.sync(pattern);
      const foundImage = matches.length > 0 ? matches[0] : null;

      if (!foundImage) {
        return res
          .status(500)
          .json({ message: "Erro ao gerar imagem da capa do PDF." });
      }

      imagePath = foundImage;
    }

    // 🔧 salvar URLs completas
    const fileUrl = buildFileUrl(req, pdfPath);
    const imageUrl = buildFileUrl(req, imagePath);

    const newBook = new Book({
      title,
      caption,
      rating,
      type,
      user: req.user._id,
      file: fileUrl,
      image: imageUrl,
      currentPage: 0,
    });

    await newBook.save();

    res.status(201).json({
      message: "Livro adicionado com sucesso!",
      book: newBook,
    });
  } catch (error) {
    console.error("Erro ao adicionar livro:", error);
    res
      .status(500)
      .json({ message: "Erro ao adicionar livro.", error: error.message });
  }
};

// Função para obter livros do usuário autenticado
export const getUserBooks = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    // 🔧 normalizar URLs antes de enviar ao frontend
    const booksWithUrls = books.map((book) => ({
      ...book.toObject(),
      file: buildFileUrl(req, book.file),
      image: buildFileUrl(req, book.image),
    }));

    res.json(booksWithUrls);
  } catch (error) {
    console.error("Erro ao obter livros do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Função para servir PDF diretamente
export const getPdf = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join("src/uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Arquivo não encontrado.");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("Erro ao servir PDF:", error);
    res.status(500).send("Erro interno ao servir o PDF.");
  }
};

// Funcão para filtrar livros por tipo
export const filterBooks = async (req, res) => {
  try {
    const { type, rating, title } = req.query;

    const filter = {};

    if (type) {
      filter.type = type; // "livro", "hq", "manga"
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "username profileImage");

    // 🔧 Adicionar URLs normalizadas
    const booksWithUrls = books.map((book) => ({
      ...book.toObject(),
      file: buildFileUrl(req, book.file),
      image: buildFileUrl(req, book.image),
    }));

    res.status(200).json(booksWithUrls);
  } catch (error) {
    console.error("Erro ao filtrar livros:", error);
    res.status(500).json({ message: "Erro ao filtrar livros" });
  }
};

// Função para deletar um livro
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Livro não encontrado." });
    }

    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Acesso negado." });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Livro deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar livro:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export default {
  getBooks,
  addBook,
  getUserBooks,
  getPdf,
  filterBooks,
  deleteBook,
};
