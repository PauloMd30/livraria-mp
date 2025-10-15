import express from "express";
// import User from "../models/User.js";
// import jwt from "jsonwebtoken";
import { register, login } from "../controllers/authControllers.js";

const router = express.Router();

// const generateToken = (userId) => {
//   return jwt.sign({ userId }, process.env.TWT_SECRET, { expiresIn: "1d" });
// };

router.post("/register", register);
router.post("/login", login);

export default router;

//   try {
//     const { username, email, password } = req.body;

//     if (!username || !email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Todos os campos são obrigatórios." });
//     }

//     if (password.length < 6) {
//       return res
//         .status(400)
//         .json({ message: "A senha deve ter pelo menos 6 caracteres." });
//     }

//     if (username.length < 3) {
//       return res.status(400).json({
//         message: "O nome de usuário deve ter pelo menos 3 caracteres.",
//       });
//     }
//     // verificar se o email é válido
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: "Email inválido." });
//     }

//     // verificar se o usuário já existe
//     const existingUsername = await User.findOne({ $or: [{ username }] });
//     if (existingUsername) {
//       return res.status(400).json({ message: "Usuário já existe." });
//     }

//     const existingEmail = await User.findOne({ email });
//     if (existingEmail) {
//       return res.status(400).json({ message: "Email já está em uso." });
//     }

//     const profileImage = `https://api.dicebear.com/6.x/initials/svg?seed=${username}`;

//     // criar novo usuário
//     const user = new User({ username, email, password, profileImage });
//     await user.save();

//     const token = generateToken(user._id);

//     res.status(201).json({
//       message: "Usuário registrado com sucesso.",
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         profileImage: user.profileImage,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Erro ao registrar usuário:", error);
//     res.status(500).json({ message: "Erro interno do servidor." });
//   }
// });

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email e senha são obrigatórios." });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Usuário não existe." });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Credenciais inválidas." });
//     }

//     const token = generateToken(user._id);

//     res.status(200).json({
//       message: "Login realizado com sucesso.",
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         profileImage: user.profileImage,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Erro ao fazer login:", error);
//     res.status(500).json({ message: "Erro interno do servidor." });
//   }
// });
