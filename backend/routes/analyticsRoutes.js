import express from 'express';
import {
    getUserGrowth,
    getSubmissionTrends,
    getProblemStats,
    getTagPopularity,
    getLanguageStats,
    getTopPerformers,
    getActivityHeatmap,
    getHourlyActivity,
    getPlatformMetrics,
    getAcceptanceRateTrend,
    getUserProfile,
    getAllAnalytics
} from '../controllers/analyticsController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require admin access
router.use(verifyToken, isAdmin);

// Individual analytics endpoints
router.get('/user-growth', getUserGrowth);
router.get('/submission-trends', getSubmissionTrends);
router.get('/problem-stats', getProblemStats);
router.get('/tag-popularity', getTagPopularity);
router.get('/language-stats', getLanguageStats);
router.get('/top-performers', getTopPerformers);
router.get('/activity-heatmap', getActivityHeatmap);
router.get('/hourly-activity', getHourlyActivity);
router.get('/platform-metrics', getPlatformMetrics);
router.get('/acceptance-rate-trend', getAcceptanceRateTrend);

// Combined endpoint (fetches all at once)
router.get('/all', getAllAnalytics);

// User profile viewing
router.get('/user-profile/:userId', getUserProfile);

export default router;
