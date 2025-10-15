import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/database.js";

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(` Servidor escutando em http://0.0.0.0:${PORT}`);
});
