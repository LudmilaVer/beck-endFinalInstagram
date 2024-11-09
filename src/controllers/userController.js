import User from '../models/userModel.js';
import getUserIdFromToken from '../utils/helpers.js';
import multer from 'multer';

// Настройка multer для загрузки изображений
const storage = multer.memoryStorage(); // Сохраняем файл в памяти
const upload = multer({ storage });

// Получение профиля конкретного пользователя по его ID
export const getCurrentUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения профиля текущего пользователя', error: error.message });
  }
};


export const getUserProfile = async (req, res) => {
  const userId = req.params.userId;
  try {
    // Попробуем загрузить пользователя вместе с его постами
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'posts', // Указываем путь к постам
        model: 'Post', // Указываем, что это модель Post
        select: 'image_url caption created_at' // Указываем поля, которые хотим получить
      });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения профиля пользователя', error: error.message });
  }
};

// Обновление профиля текущего пользователя
export const updateUserProfile = async (req, res) => {
  const userId = getUserIdFromToken(req); // Идентифицируем пользователя по токену
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const { username, bio } = req.body;

    // Обновляем имя пользователя и био, если они переданы
    if (username) user.username = username;
    if (bio) user.bio = bio;

    // Если передано изображение, преобразуем его в Base64
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64'); // Преобразуем файл в Base64
      user.profile_image = base64Image;
    }

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления профиля', error: error.message });
  }
};

// Получение всех пользователей
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Извлекаем всех пользователей, кроме пароля
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении пользователей', error: error.message });
  }
};

// Экспорт загрузки для использования в маршрутах
export const uploadProfileImage = upload.single('profile_image');
