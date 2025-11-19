import Book from "../models/book.js";

export const migrateBooks = async (req, res) => {
  try {
    const books = await Book.find();

    let updatedCount = 0;

    for (const book of books) {
      let file = book.file || "";
      let image = book.image || "";

      // Normaliza barras
      file = file.replace(/\\/g, "/");
      image = image.replace(/\\/g, "/");

      // Remove paths absolutos "/usr/src/app/"
      file = file.replace(/^.*uploads\//, "uploads/");
      image = image.replace(/^.*uploads\//, "uploads/");

      // Remove URLs completas
      file = file.replace(/^https?:\/\/[^/]+\//, "");
      image = image.replace(/^https?:\/\/[^/]+\//, "");

      // Garante formato final
      if (!file.startsWith("uploads/")) file = "uploads/" + file;
      if (!image.startsWith("uploads/")) image = "uploads/" + image;

      // Se mudou, atualiza
      if (book.file !== file || book.image !== image) {
        book.file = file;
        book.image = image;
        await book.save();
        updatedCount++;
      }
    }

    res.json({
      message: "Migração concluída com sucesso",
      totalBooks: books.length,
      updatedCount,
    });
  } catch (error) {
    console.error("Erro na migração:", error);
    res.status(500).json({ message: "Erro interno na migração" });
  }
};
