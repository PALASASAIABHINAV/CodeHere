import express from 'express';
import { getLeaderboard, getUserRank } from '../controllers/leaderboardController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public leaderboard with category support (?category=dsa|frontend|global)
router.get('/', optionalAuth, getLeaderboard);

// Get user's comprehensive rankings
router.get('/user/:userId', getUserRank);

export default router;

