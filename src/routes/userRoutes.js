import express from 'express';
import { 
  getUserProfile, 
  getCurrentUserProfile, 
  updateUserProfile, 
  uploadProfileImage, 
  getAllUsers 
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Получение профиля конкретного пользователя по ID
router.get('/:userId', getUserProfile);

// Получение профиля текущего пользователя
router.get('/current', authMiddleware, getCurrentUserProfile);

// Получение всех пользователей
router.get('/', getAllUsers);

// Обновление профиля текущего пользователя с загрузкой изображения
router.put('/current', authMiddleware, uploadProfileImage, updateUserProfile);

export default router;
