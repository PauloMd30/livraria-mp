import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  try {
    //buscar o token do cabeçalho de autorização
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token)
      return res
        .status(401)
        .json({ message: "Acesso negado, token não fornecido." });
    //verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //buscar o usuário pelo ID decodificado
    const user = await User.findById(decoded.userId).select("-password");
    if (!user)
      return res.status(401).json({ message: "Usuário não encontrado." });

    req.user = user; // Adiciona o usuário ao objeto de requisição
    next(); // Chama o próximo middleware ou rota
  } catch (error) {
    console.error("Erro no middleware de autenticação:", error);
    res.status(401).json({ message: "Token inválido ou expirado." });
  }
};

export default protectRoute;
