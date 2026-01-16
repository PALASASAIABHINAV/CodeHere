import express from 'express';
import { signup, login, logout, getMe } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (require authentication)
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);

export default router;