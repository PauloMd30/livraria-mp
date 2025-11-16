import path from "path";
import fs from "fs";
import { PDFImage } from "pdf-image";
import Book from "../models/book.js";

const buildFileUrl = (req, filePath) => {
  if (!filePath) return null;

  // Se for um caminho relativo, constrói a URL completa
  if (!filePath.startsWith("http")) {
    return `${req.protocol}://${req.get("host")}/${filePath.replace(
      /\\/g,
      "/"
    )}`;
  }

  // Se já é URL completa, retorna como está
  return filePath;
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
      // Se o usuário enviou uma imagem manualmente
      imagePath = req.files["image"][0].path;
    } else {
      // Gera uma imagem a partir da primeira página do PDF
      const outputDir = path.dirname(pdfPath);
      const outputPrefix = path.basename(pdfPath, ".pdf");

      const pdfImage = new PDFImage(pdfPath, {
        convertOptions: {
          "-resize": "1024x1024",
        },
        outputDirectory: outputDir,
        outputPrefix,
      });

      console.log("🔄 Gerando capa a partir do PDF...");
      imagePath = await pdfImage.convertPage(0); // primeira página
      console.log("✅ Capa gerada:", imagePath);
    }

    const newBook = new Book({
      title,
      caption,
      rating,
      type,
      user: req.user._id,
      file: pdfPath,
      image: imagePath,
      currentPage: 0,
    });

    await newBook.save();

    res.status(201).json({
      message: "Livro adicionado com sucesso!",
      book: newBook,
    });
  } catch (error) {
    console.error("❌ Erro ao adicionar livro:", error);
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
