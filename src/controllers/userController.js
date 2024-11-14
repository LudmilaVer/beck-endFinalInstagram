import User from "../models/userModel.js";
import multer from "multer";

// Настройка multer для загрузки изображений
const storage = multer.memoryStorage(); // Сохраняем файл в памяти
const upload = multer({ storage });

// Экспорт загрузки изображения для использования в маршрутах
export const uploadProfileImage = upload.single("profile_image");

// Получение профиля текущего пользователя
export const getCurrentUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Ошибка получения профиля текущего пользователя:", error);
    res.status(500).json({ message: "Ошибка получения профиля текущего пользователя", error: error.message });
  }
};

// Получение профиля пользователя по ID
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate({
        path: "posts",
        model: "Post",
        select: "image_url caption created_at",
      });

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Ошибка получения профиля пользователя:", error);
    res.status(500).json({ message: "Ошибка получения профиля пользователя", error: error.message });
  }
};

// Обновление профиля текущего пользователя
export const updateUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const { username, bio } = req.body;
    if (username) user.username = username;
    if (bio) user.bio = bio;

    // Если изображение загружено, преобразуем его в Base64
    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      user.profile_image = base64Image;
    }

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Ошибка обновления профиля:", error);
    res.status(500).json({ message: "Ошибка обновления профиля", error: error.message });
  }
};

// Получение всех пользователей
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    res.status(500).json({ message: "Ошибка при получении пользователей", error: error.message });
  }
};
