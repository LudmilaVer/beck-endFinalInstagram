import express from 'express';
import {
  getUserProfile,
  getCurrentUserProfile,
  updateUserProfile,
  uploadProfileImage,
  getAllUsers,
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/current', authMiddleware, getCurrentUserProfile);
router.get('/:userId', getUserProfile);
router.put('/current', authMiddleware, uploadProfileImage, updateUserProfile);
router.get('/', getAllUsers);

export default router;
