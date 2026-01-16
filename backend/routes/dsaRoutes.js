import express from 'express';
import {
  getAllProblems,
  getProblemBySlug,
  runCode,
  submitCode,
  getUserSubmissions,
  getUserStats,
} from '../controllers/dsaController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (can view problems without login)
router.get('/problems', optionalAuth, getAllProblems);
router.get('/problems/:slug', optionalAuth, getProblemBySlug);

// Protected routes (require login)
router.post('/run', verifyToken, runCode);
router.post('/submit', verifyToken, submitCode);
router.get('/submissions/:problemId', verifyToken, getUserSubmissions);
router.get('/stats', verifyToken, getUserStats);

export default router;