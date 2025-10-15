import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Pode ser o caminho para a imagem ou URL
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    type: {
      type: String,
      enum: ["livro", "hq", "manga"], // Permite definir o tipo do conteúdo
      required: true,
    },
    file: {
      type: String, // Pode ser a URL do PDF ou caminho no servidor
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentPage: {
      type: Number,
      default: 0, // Para controlar a página atual em que o usuário parou
    },
    chapters: [
      {
        chapterNumber: Number,
        title: String,
        pdfUrl: String, // Caso você tenha capítulos em PDF separados
      },
    ],
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);
export default Book;
