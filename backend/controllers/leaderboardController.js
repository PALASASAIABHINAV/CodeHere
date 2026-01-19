import Analytics from '../models/Analytics.js';

// Get Leaderboard by Category (DSA, Frontend, or Global)
export const getLeaderboard = async (req, res) => {
  try {
    const { category = 'global' } = req.query;
    let leaderboard;

    switch (category.toLowerCase()) {
      case 'dsa':
        leaderboard = await Analytics.getDSALeaderboard(100);
        break;
      case 'frontend':
        leaderboard = await Analytics.getFrontendLeaderboard(100);
        break;
      case 'global':
      default:
        leaderboard = await Analytics.getGlobalLeaderboard(100);
        break;
    }

    res.json({
      success: true,
      category,
      leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get User's Comprehensive Rankings
export const getUserRank = async (req, res) => {
  try {
    const userId = req.params.userId;

    const rankings = await Analytics.getUserRankings(userId);

    if (!rankings) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Determine badges based on ranks
    const badges = [];

    if (rankings.global_rank === 1) badges.push({ type: 'champion', label: 'Champion', icon: '🏆' });
    if (rankings.dsa_rank === 1) badges.push({ type: 'dsa_king', label: 'DSA King', icon: '👑' });
    if (rankings.frontend_rank === 1) badges.push({ type: 'frontend_king', label: 'Frontend King', icon: '👑' });

    // Specific badges for rank 2 and 3
    if (rankings.global_rank === 2) {
      badges.push({ type: 'silver_medal', label: 'Silver Medal', icon: '🥈' });
    } else if (rankings.global_rank === 3) {
      badges.push({ type: 'bronze_medal', label: 'Bronze Medal', icon: '🥉' });
    }

    if (rankings.global_rank <= 10 && rankings.global_rank > 3) {
      badges.push({ type: 'top_10', label: 'Top 10', icon: '⭐' });
    }

    // Check if consistent performer (top 10 in 2+ categories)
    const topTenCount = [rankings.dsa_rank, rankings.frontend_rank].filter(rank => rank <= 10).length;
    if (topTenCount >= 2) {
      badges.push({ type: 'consistent', label: 'Consistent Performer', icon: '🔥' });
    }

    res.json({
      success: true,
      data: {
        ...rankings,
        badges
      }
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
