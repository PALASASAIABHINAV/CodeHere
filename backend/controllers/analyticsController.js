import Analytics from '../models/Analytics.js';

// Get User Growth Data
export const getUserGrowth = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = await Analytics.getUserGrowth(days);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get user growth error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Submission Trends
export const getSubmissionTrends = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = await Analytics.getSubmissionTrends(days);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get submission trends error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Problem Statistics
export const getProblemStats = async (req, res) => {
    try {
        const data = await Analytics.getProblemStats();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get problem stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Tag Popularity
export const getTagPopularity = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const data = await Analytics.getTagPopularity(limit);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get tag popularity error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Language Statistics
export const getLanguageStats = async (req, res) => {
    try {
        const data = await Analytics.getLanguageStats();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get language stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Top Performers
export const getTopPerformers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const data = await Analytics.getTopPerformers(limit);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get top performers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Activity Heatmap
export const getActivityHeatmap = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 90;
        const data = await Analytics.getActivityHeatmap(days);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get activity heatmap error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Hourly Activity
export const getHourlyActivity = async (req, res) => {
    try {
        const data = await Analytics.getHourlyActivity();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get hourly activity error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Platform Metrics
export const getPlatformMetrics = async (req, res) => {
    try {
        const data = await Analytics.getPlatformMetrics();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get platform metrics error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Acceptance Rate Trend
export const getAcceptanceRateTrend = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = await Analytics.getAcceptanceRateTrend(days);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get acceptance rate trend error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get User Profile (Admin viewing any user)
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await Analytics.getUserProfile(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get All Analytics Data (Combined endpoint for dashboard)
export const getAllAnalytics = async (req, res) => {
    try {
        const [
            userGrowth,
            submissionTrends,
            problemStats,
            tagPopularity,
            languageStats,
            topPerformers,
            platformMetrics,
            acceptanceRateTrend,
            hourlyActivity,
            statusDistribution
        ] = await Promise.all([
            Analytics.getUserGrowth(30),
            Analytics.getSubmissionTrends(30),
            Analytics.getProblemStats(),
            Analytics.getTagPopularity(10),
            Analytics.getLanguageStats(),
            Analytics.getTopPerformers(10),
            Analytics.getPlatformMetrics(),
            Analytics.getAcceptanceRateTrend(30),
            Analytics.getHourlyActivity(),
            Analytics.getStatusDistribution()
        ]);

        res.json({
            success: true,
            data: {
                userGrowth,
                submissionTrends,
                problemStats,
                tagPopularity,
                languageStats,
                topPerformers,
                platformMetrics,
                acceptanceRateTrend,
                hourlyActivity,
                statusDistribution
            }
        });
    } catch (error) {
        console.error('Get all analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
