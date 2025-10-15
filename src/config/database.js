import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`banco de dados conectado`);
  } catch (error) {
    console.log("erro ao conectar no banco de dados", error);
    process.exit(1);
  }
};
