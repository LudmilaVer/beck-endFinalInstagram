import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Доступ запрещен. Токен не предоставлен." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    if (!userId) {
      return res.status(401).json({ message: "Некорректный токен. Идентификатор пользователя отсутствует." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Пользователь не найден." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    res.status(401).json({ message: "Неверный токен." });
  }
};

export default authMiddleware;
