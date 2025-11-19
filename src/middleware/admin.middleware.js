const adminKey = process.env.ADMIN_KEY || "54321";

const adminMiddleware = (req, res, next) => {
  const key = req.headers["x-admin-key"];

  if (key !== adminKey) {
    return res.status(403).json({ message: "Acesso negado." });
  }

  next();
};

export default adminMiddleware;
