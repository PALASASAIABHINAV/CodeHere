import express from 'express';
import { getLeaderboard, getUserRank } from '../controllers/leaderboardController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public leaderboard (no auth required, but can be authenticated)
router.get('/', optionalAuth, getLeaderboard);

// Get user's rank
router.get('/rank/:userId', getUserRank);

export default router;
