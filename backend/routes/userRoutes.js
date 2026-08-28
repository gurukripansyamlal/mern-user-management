import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Profile routes
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin-only listing of all users
router.route('/').get(protect, adminOnly, getAllUsers);

// Delete user by ID (Self or Admin)
router.route('/:id').delete(protect, deleteUser);

export default router;
