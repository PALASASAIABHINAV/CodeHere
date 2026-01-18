import pool from '../config/db.js';

// Get Global Leaderboard
// Get Global Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    // User requested strictly top 100, removing search
    const query = `
      SELECT 
        u.id, u.name, u.email, u.profile_picture_url, u.is_prime,
        COALESCE(stats.problems_solved, 0) as problems_solved,
        COALESCE(stats.easy_solved, 0) as easy_solved,
        COALESCE(stats.medium_solved, 0) as medium_solved,
        COALESCE(stats.hard_solved, 0) as hard_solved,
        COALESCE(subs.total_submissions, 0) as total_submissions,
        COALESCE(subs.accepted_submissions, 0) as accepted_submissions,
        CASE 
          WHEN COALESCE(subs.total_submissions, 0) > 0 
          THEN ROUND((COALESCE(subs.accepted_submissions, 0)::numeric / subs.total_submissions::numeric * 100), 1)
          ELSE 0 
        END as acceptance_rate
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(DISTINCT problem_id) as problems_solved,
          COUNT(DISTINCT CASE WHEN p.difficulty = 'Easy' THEN problem_id END) as easy_solved,
          COUNT(DISTINCT CASE WHEN p.difficulty = 'Medium' THEN problem_id END) as medium_solved,
          COUNT(DISTINCT CASE WHEN p.difficulty = 'Hard' THEN problem_id END) as hard_solved
        FROM user_problem_status ups
        JOIN dsa_problems p ON ups.problem_id = p.id
        WHERE ups.status = 'solved'
        GROUP BY user_id
      ) stats ON u.id = stats.user_id
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) as total_submissions,
          COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted_submissions
        FROM user_submissions
        GROUP BY user_id
      ) subs ON u.id = subs.user_id
      ORDER BY problems_solved DESC, acceptance_rate DESC
      LIMIT 100
    `;

    const result = await pool.query(query);

    // Add rank to each user
    const leaderboard = result.rows.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Get User Rank
// Get User Rank
export const getUserRank = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Get user's specific stats (Solved & Acceptance Rate)
    const userStatsQuery = `
      SELECT 
        COALESCE(stats.problems_solved, 0) as problems_solved,
        CASE 
          WHEN COALESCE(subs.total_submissions, 0) > 0 
          THEN ROUND((COALESCE(subs.accepted_submissions, 0)::numeric / subs.total_submissions::numeric * 100), 1)
          ELSE 0 
        END as acceptance_rate
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(DISTINCT problem_id) as problems_solved
        FROM user_problem_status
        WHERE status = 'solved'
        GROUP BY user_id
      ) stats ON u.id = stats.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as total_submissions, COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted_submissions
        FROM user_submissions
        GROUP BY user_id
      ) subs ON u.id = subs.user_id
      WHERE u.id = $1
    `;

    const userStatsResult = await pool.query(userStatsQuery, [userId]);
    const userStats = userStatsResult.rows[0];

    if (!userStats) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const mySolved = parseFloat(userStats.problems_solved);
    const myRate = parseFloat(userStats.acceptance_rate);

    // 2. Count users who are strictly better
    const rankQuery = `
      SELECT COUNT(*) as better_count
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(DISTINCT problem_id) as problems_solved
        FROM user_problem_status
        WHERE status = 'solved'
        GROUP BY user_id
      ) stats ON u.id = stats.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as total_submissions, COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted_submissions
        FROM user_submissions
        GROUP BY user_id
      ) subs ON u.id = subs.user_id
      WHERE 
        COALESCE(stats.problems_solved, 0) > $1
        OR 
        (
          COALESCE(stats.problems_solved, 0) = $1 
          AND 
          (
            CASE 
              WHEN COALESCE(subs.total_submissions, 0) > 0 
              THEN ROUND((COALESCE(subs.accepted_submissions, 0)::numeric / subs.total_submissions::numeric * 100), 1)
              ELSE 0 
            END
          ) > $2
        )
    `;

    const rankResult = await pool.query(rankQuery, [mySolved, myRate]);
    const betterCount = parseInt(rankResult.rows[0].better_count);
    const rank = betterCount + 1;

    // Get total users
    const totalQuery = `SELECT COUNT(*) as total FROM users`;
    const totalResult = await pool.query(totalQuery);
    const totalUsers = parseInt(totalResult.rows[0]?.total) || 1;

    res.json({
      success: true,
      data: {
        rank,
        totalUsers,
        percentile: 0,
        problemsSolved: mySolved
      }
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

