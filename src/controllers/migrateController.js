import Book from "../models/book.js";

// helper para construir URL
const buildFileUrl = (req, filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath; // já está ok
  }
  return `${req.protocol}://${req.get("host")}/${filePath.replace(/\\/g, "/")}`;
};

export const migrateBooks = async (req, res) => {
  try {
    const books = await Book.find();

    let updatedCount = 0;

    for (const book of books) {
      const newFile = buildFileUrl(req, book.file);
      const newImage = buildFileUrl(req, book.image);

      // Só atualiza se mudar algo
      if (book.file !== newFile || book.image !== newImage) {
        book.file = newFile;
        book.image = newImage;
        await book.save();
        updatedCount++;
      }
    }

    res.json({
      message: "Migração concluída",
      totalBooks: books.length,
      updatedCount,
    });
  } catch (error) {
    console.error("Erro na migração:", error);
    res.status(500).json({ message: "Erro interno na migração" });
  }
};
