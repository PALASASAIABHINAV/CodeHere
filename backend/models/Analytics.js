import pool from '../config/db.js';

class Analytics {
    // User Growth Over Time
    static async getUserGrowth(days = 30) {
        try {
            const query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*)::int as new_users,
          SUM(COUNT(*)) OVER (ORDER BY DATE(created_at))::int as total_users
        FROM users
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Submission Trends
    static async getSubmissionTrends(days = 30) {
        try {
            const query = `
        SELECT 
          DATE(submitted_at) as date,
          COUNT(*)::int as total,
          COUNT(CASE WHEN status = 'Accepted' THEN 1 END)::int as accepted,
          COUNT(CASE WHEN status != 'Accepted' THEN 1 END)::int as failed,
          COUNT(CASE WHEN language = 'javascript' THEN 1 END)::int as javascript,
          COUNT(CASE WHEN language = 'cpp' THEN 1 END)::int as cpp
        FROM user_submissions
        WHERE submitted_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(submitted_at)
        ORDER BY date ASC
      `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Problem Statistics
    static async getProblemStats() {
        try {
            const query = `
        SELECT 
          difficulty,
          COUNT(*)::int as count,
          AVG(acceptance_rate::numeric) as avg_acceptance
        FROM dsa_problems
        GROUP BY difficulty
      `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Tag Popularity
    static async getTagPopularity(limit = 10) {
        try {
            const query = `
        SELECT 
          tag,
          COUNT(*)::int as count
        FROM dsa_problems, unnest(tags) as tag
        GROUP BY tag
        ORDER BY count DESC
        LIMIT $1
      `;
            const result = await pool.query(query, [limit]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Language Usage Statistics
    static async getLanguageStats() {
        try {
            const query = `
        SELECT 
          language,
          COUNT(*)::int as total_submissions,
          COUNT(CASE WHEN status = 'Accepted' THEN 1 END)::int as accepted,
          ROUND((COUNT(CASE WHEN status = 'Accepted' THEN 1 END)::numeric / COUNT(*)::numeric * 100), 1) as success_rate
        FROM user_submissions
        GROUP BY language
      `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Top Performers
    static async getTopPerformers(limit = 10) {
        try {
            const query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.profile_picture_url,
          COUNT(DISTINCT ups.problem_id)::int as problems_solved,
          u.streak,
          u.is_prime
        FROM users u
        LEFT JOIN user_problem_status ups ON u.id = ups.user_id AND ups.status = 'solved'
        GROUP BY u.id, u.name, u.email, u.profile_picture_url, u.streak, u.is_prime
        ORDER BY problems_solved DESC, u.streak DESC
        LIMIT $1
      `;
            const result = await pool.query(query, [limit]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Activity Heatmap
    static async getActivityHeatmap(days = 90) {
        try {
            const query = `
        SELECT 
          DATE(submitted_at) as date,
          COUNT(*)::int as count
        FROM user_submissions
        WHERE submitted_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(submitted_at)
        ORDER BY date ASC
      `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Hourly Activity Pattern
    static async getHourlyActivity() {
        try {
            const query = `
        SELECT 
          EXTRACT(HOUR FROM submitted_at) as hour,
          COUNT(*)::int as count
        FROM user_submissions
        WHERE submitted_at >= NOW() - INTERVAL '30 days'
        GROUP BY hour
        ORDER BY hour ASC
      `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Platform Metrics
    static async getPlatformMetrics() {
        try {
            const query = `
        SELECT 
          (SELECT COUNT(*) FROM users)::int as total_users,
          (SELECT COUNT(*) FROM user_submissions)::int as total_submissions,
          (SELECT COUNT(*) FROM dsa_problems)::int as total_problems,
          (SELECT COUNT(DISTINCT user_id) FROM user_submissions WHERE submitted_at > NOW() - INTERVAL '24 hours')::int as active_users_24h,
          (SELECT COUNT(DISTINCT user_id) FROM user_submissions WHERE submitted_at > NOW() - INTERVAL '7 days')::int as active_users_7d,
          (SELECT COUNT(*) FROM user_submissions WHERE DATE(submitted_at) = CURRENT_DATE)::int as today_submissions,
          (SELECT AVG(EXTRACT(EPOCH FROM (s.submitted_at - u.created_at))/86400) 
           FROM user_submissions s 
           JOIN users u ON s.user_id = u.id 
           WHERE s.status = 'Accepted') as avg_days_to_solve
      `;
            const result = await pool.query(query);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Submission Status Distribution
    static async getStatusDistribution() {
        try {
            const query = `
        SELECT 
          status,
          COUNT(*)::int as count
        FROM user_submissions
        GROUP BY status
      `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Acceptance Rate Trend
    static async getAcceptanceRateTrend(days = 30) {
        try {
            const query = `
        SELECT 
          DATE(submitted_at) as date,
          ROUND((COUNT(CASE WHEN status = 'Accepted' THEN 1 END)::numeric / COUNT(*)::numeric * 100), 1) as acceptance_rate
        FROM user_submissions
        WHERE submitted_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(submitted_at)
        HAVING COUNT(*) > 0
        ORDER BY date ASC
      `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get user profile for admin viewing
    static async getUserProfile(userId) {
        try {
            const userQuery = `
        SELECT 
          u.*,
          COUNT(DISTINCT CASE WHEN ups.status = 'solved' THEN ups.problem_id END) as problems_solved,
          COUNT(DISTINCT CASE WHEN ups.status = 'attempted' THEN ups.problem_id END) as problems_attempted,
          COUNT(DISTINCT s.id) as total_submissions
        FROM users u
        LEFT JOIN user_problem_status ups ON u.id = ups.user_id
        LEFT JOIN user_submissions s ON u.id = s.user_id
        WHERE u.id = $1
        GROUP BY u.id
      `;
            const userResult = await pool.query(userQuery, [userId]);

            if (userResult.rows.length === 0) return null;

            const user = userResult.rows[0];

            // Get recent submissions
            const submissionsQuery = `
        SELECT 
          s.*,
          p.title as problem_title,
          p.difficulty
        FROM user_submissions s
        JOIN dsa_problems p ON s.problem_id = p.id
        WHERE s.user_id = $1
        ORDER BY s.submitted_at DESC
        LIMIT 10
      `;
            const submissionsResult = await pool.query(submissionsQuery, [userId]);

            user.recent_submissions = submissionsResult.rows;

            return user;
        } catch (error) {
            throw error;
        }
    }

    // Frontend Project Analytics
    static async getFrontendProjectStats() {
        try {
            const query = `
                SELECT 
                    difficulty,
                    COUNT(*)::int as count
                FROM frontend_projects
                GROUP BY difficulty
                ORDER BY difficulty ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async getFrontendSubmissionStats() {
        try {
            const query = `
                SELECT 
                    status,
                    COUNT(*)::int as count
                FROM frontend_submissions
                GROUP BY status
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async getFrontendTagStats() {
        try {
            const query = `
                SELECT 
                    tag,
                    COUNT(*)::int as count
                FROM frontend_projects, unnest(tags) as tag
                GROUP BY tag
                ORDER BY count DESC
                LIMIT 10
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // ==================== LEADERBOARD SYSTEM ====================

    // Get DSA Leaderboard (Top 100 by DSA Points)
    static async getDSALeaderboard(limit = 100) {
        try {
            const query = `
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.profile_picture_url,
                    u.is_prime,
                    COALESCE(SUM(
                        CASE 
                            WHEN p.difficulty = 'Easy' THEN 10
                            WHEN p.difficulty = 'Medium' THEN 15
                            WHEN p.difficulty = 'Hard' THEN 20
                            ELSE 0
                        END
                    ), 0)::int as dsa_points,
                    COUNT(DISTINCT ups.problem_id)::int as problems_solved,
                    COUNT(DISTINCT CASE WHEN p.difficulty = 'Easy' THEN ups.problem_id END)::int as easy_solved,
                    COUNT(DISTINCT CASE WHEN p.difficulty = 'Medium' THEN ups.problem_id END)::int as medium_solved,
                    COUNT(DISTINCT CASE WHEN p.difficulty = 'Hard' THEN ups.problem_id END)::int as hard_solved
                FROM users u
                LEFT JOIN user_problem_status ups ON u.id = ups.user_id AND ups.status = 'solved'
                LEFT JOIN dsa_problems p ON ups.problem_id = p.id
                GROUP BY u.id, u.name, u.email, u.profile_picture_url, u.is_prime
                ORDER BY dsa_points DESC, problems_solved DESC
                LIMIT $1
            `;
            const result = await pool.query(query, [limit]);

            // Add rank to each user
            return result.rows.map((user, index) => ({
                ...user,
                rank: index + 1
            }));
        } catch (error) {
            throw error;
        }
    }

    // Get Frontend Leaderboard (Top 100 by Frontend Points)
    static async getFrontendLeaderboard(limit = 100) {
        try {
            const query = `
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.profile_picture_url,
                    u.is_prime,
                    COALESCE(SUM(
                        CASE 
                            WHEN fp.difficulty = 'Easy' THEN 50
                            WHEN fp.difficulty = 'Medium' THEN 75
                            WHEN fp.difficulty = 'Hard' THEN 100
                            ELSE 0
                        END
                    ), 0)::int as frontend_points,
                    COUNT(DISTINCT fs.project_id)::int as projects_completed,
                    COUNT(DISTINCT CASE WHEN fp.difficulty = 'Easy' THEN fs.project_id END)::int as easy_completed,
                    COUNT(DISTINCT CASE WHEN fp.difficulty = 'Medium' THEN fs.project_id END)::int as medium_completed,
                    COUNT(DISTINCT CASE WHEN fp.difficulty = 'Hard' THEN fs.project_id END)::int as hard_completed
                FROM users u
                LEFT JOIN frontend_submissions fs ON u.id = fs.user_id AND fs.status = 'completed'
                LEFT JOIN frontend_projects fp ON fs.project_id = fp.id
                GROUP BY u.id, u.name, u.email, u.profile_picture_url, u.is_prime
                ORDER BY frontend_points DESC, projects_completed DESC
                LIMIT $1
            `;
            const result = await pool.query(query, [limit]);

            // Add rank to each user
            return result.rows.map((user, index) => ({
                ...user,
                rank: index + 1
            }));
        } catch (error) {
            throw error;
        }
    }

    // Get Global Leaderboard (Top 100 by Total Points: DSA + Frontend)
    static async getGlobalLeaderboard(limit = 100) {
        try {
            const query = `
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.profile_picture_url,
                    u.is_prime,
                    COALESCE(dsa_stats.dsa_points, 0)::int as dsa_points,
                    COALESCE(frontend_stats.frontend_points, 0)::int as frontend_points,
                    (COALESCE(dsa_stats.dsa_points, 0) + COALESCE(frontend_stats.frontend_points, 0))::int as total_points,
                    COALESCE(dsa_stats.problems_solved, 0)::int as problems_solved,
                    COALESCE(frontend_stats.projects_completed, 0)::int as projects_completed
                FROM users u
                LEFT JOIN (
                    SELECT 
                        ups.user_id,
                        SUM(
                            CASE 
                                WHEN p.difficulty = 'Easy' THEN 10
                                WHEN p.difficulty = 'Medium' THEN 15
                                WHEN p.difficulty = 'Hard' THEN 20
                                ELSE 0
                            END
                        ) as dsa_points,
                        COUNT(DISTINCT ups.problem_id) as problems_solved
                    FROM user_problem_status ups
                    JOIN dsa_problems p ON ups.problem_id = p.id
                    WHERE ups.status = 'solved'
                    GROUP BY ups.user_id
                ) dsa_stats ON u.id = dsa_stats.user_id
                LEFT JOIN (
                    SELECT 
                        fs.user_id,
                        SUM(
                            CASE 
                                WHEN fp.difficulty = 'Easy' THEN 50
                                WHEN fp.difficulty = 'Medium' THEN 75
                                WHEN fp.difficulty = 'Hard' THEN 100
                                ELSE 0
                            END
                        ) as frontend_points,
                        COUNT(DISTINCT fs.project_id) as projects_completed
                    FROM frontend_submissions fs
                    JOIN frontend_projects fp ON fs.project_id = fp.id
                    WHERE fs.status = 'completed'
                    GROUP BY fs.user_id
                ) frontend_stats ON u.id = frontend_stats.user_id
                ORDER BY total_points DESC, problems_solved DESC, projects_completed DESC
                LIMIT $1
            `;
            const result = await pool.query(query, [limit]);

            // Add rank to each user
            return result.rows.map((user, index) => ({
                ...user,
                rank: index + 1
            }));
        } catch (error) {
            throw error;
        }
    }

    // Get User's Comprehensive Rankings (DSA, Frontend, Global)
    static async getUserRankings(userId) {
        try {
            // Get user's points
            const userPointsQuery = `
                SELECT 
                    u.id,
                    u.name,
                    u.profile_picture_url,
                    u.is_prime,
                    COALESCE(dsa_stats.dsa_points, 0)::int as dsa_points,
                    COALESCE(frontend_stats.frontend_points, 0)::int as frontend_points,
                    (COALESCE(dsa_stats.dsa_points, 0) + COALESCE(frontend_stats.frontend_points, 0))::int as total_points,
                    COALESCE(dsa_stats.problems_solved, 0)::int as problems_solved,
                    COALESCE(dsa_stats.easy_solved, 0)::int as easy_solved,
                    COALESCE(dsa_stats.medium_solved, 0)::int as medium_solved,
                    COALESCE(dsa_stats.hard_solved, 0)::int as hard_solved,
                    COALESCE(frontend_stats.projects_completed, 0)::int as projects_completed,
                    COALESCE(frontend_stats.easy_completed, 0)::int as easy_completed,
                    COALESCE(frontend_stats.medium_completed, 0)::int as medium_completed,
                    COALESCE(frontend_stats.hard_completed, 0)::int as hard_completed
                FROM users u
                LEFT JOIN (
                    SELECT 
                        ups.user_id,
                        SUM(
                            CASE 
                                WHEN p.difficulty = 'Easy' THEN 10
                                WHEN p.difficulty = 'Medium' THEN 15
                                WHEN p.difficulty = 'Hard' THEN 20
                                ELSE 0
                            END
                        ) as dsa_points,
                        COUNT(DISTINCT ups.problem_id) as problems_solved,
                        COUNT(DISTINCT CASE WHEN p.difficulty = 'Easy' THEN ups.problem_id END) as easy_solved,
                        COUNT(DISTINCT CASE WHEN p.difficulty = 'Medium' THEN ups.problem_id END) as medium_solved,
                        COUNT(DISTINCT CASE WHEN p.difficulty = 'Hard' THEN ups.problem_id END) as hard_solved
                    FROM user_problem_status ups
                    JOIN dsa_problems p ON ups.problem_id = p.id
                    WHERE ups.status = 'solved'
                    GROUP BY ups.user_id
                ) dsa_stats ON u.id = dsa_stats.user_id
                LEFT JOIN (
                    SELECT 
                        fs.user_id,
                        SUM(
                            CASE 
                                WHEN fp.difficulty = 'Easy' THEN 50
                                WHEN fp.difficulty = 'Medium' THEN 75
                                WHEN fp.difficulty = 'Hard' THEN 100
                                ELSE 0
                            END
                        ) as frontend_points,
                        COUNT(DISTINCT fs.project_id) as projects_completed,
                        COUNT(DISTINCT CASE WHEN fp.difficulty = 'Easy' THEN fs.project_id END) as easy_completed,
                        COUNT(DISTINCT CASE WHEN fp.difficulty = 'Medium' THEN fs.project_id END) as medium_completed,
                        COUNT(DISTINCT CASE WHEN fp.difficulty = 'Hard' THEN fs.project_id END) as hard_completed
                    FROM frontend_submissions fs
                    JOIN frontend_projects fp ON fs.project_id = fp.id
                    WHERE fs.status = 'completed'
                    GROUP BY fs.user_id
                ) frontend_stats ON u.id = frontend_stats.user_id
                WHERE u.id = $1
            `;
            const userResult = await pool.query(userPointsQuery, [userId]);

            if (userResult.rows.length === 0) {
                return null;
            }

            const userData = userResult.rows[0];

            // Calculate DSA Rank
            const dsaRankQuery = `
                SELECT COUNT(*) + 1 as rank
                FROM (
                    SELECT 
                        u.id,
                        COALESCE(SUM(
                            CASE 
                                WHEN p.difficulty = 'Easy' THEN 10
                                WHEN p.difficulty = 'Medium' THEN 15
                                WHEN p.difficulty = 'Hard' THEN 20
                                ELSE 0
                            END
                        ), 0) as dsa_points,
                        COUNT(DISTINCT ups.problem_id) as problems_solved
                    FROM users u
                    LEFT JOIN user_problem_status ups ON u.id = ups.user_id AND ups.status = 'solved'
                    LEFT JOIN dsa_problems p ON ups.problem_id = p.id
                    GROUP BY u.id
                    HAVING COALESCE(SUM(
                        CASE 
                            WHEN p.difficulty = 'Easy' THEN 10
                            WHEN p.difficulty = 'Medium' THEN 15
                            WHEN p.difficulty = 'Hard' THEN 20
                            ELSE 0
                        END
                    ), 0) > $1
                    OR (
                        COALESCE(SUM(
                            CASE 
                                WHEN p.difficulty = 'Easy' THEN 10
                                WHEN p.difficulty = 'Medium' THEN 15
                                WHEN p.difficulty = 'Hard' THEN 20
                                ELSE 0
                            END
                        ), 0) = $1
                        AND COUNT(DISTINCT ups.problem_id) > $2
                    )
                ) ranked_users
            `;
            const dsaRankResult = await pool.query(dsaRankQuery, [userData.dsa_points, userData.problems_solved]);

            // Calculate Frontend Rank
            const frontendRankQuery = `
                SELECT COUNT(*) + 1 as rank
                FROM (
                    SELECT 
                        u.id,
                        COALESCE(SUM(
                            CASE 
                                WHEN fp.difficulty = 'Easy' THEN 50
                                WHEN fp.difficulty = 'Medium' THEN 75
                                WHEN fp.difficulty = 'Hard' THEN 100
                                ELSE 0
                            END
                        ), 0) as frontend_points,
                        COUNT(DISTINCT fs.project_id) as projects_completed
                    FROM users u
                    LEFT JOIN frontend_submissions fs ON u.id = fs.user_id AND fs.status = 'completed'
                    LEFT JOIN frontend_projects fp ON fs.project_id = fp.id
                    GROUP BY u.id
                    HAVING COALESCE(SUM(
                        CASE 
                            WHEN fp.difficulty = 'Easy' THEN 50
                            WHEN fp.difficulty = 'Medium' THEN 75
                            WHEN fp.difficulty = 'Hard' THEN 100
                            ELSE 0
                        END
                    ), 0) > $1
                    OR (
                        COALESCE(SUM(
                            CASE 
                                WHEN fp.difficulty = 'Easy' THEN 50
                                WHEN fp.difficulty = 'Medium' THEN 75
                                WHEN fp.difficulty = 'Hard' THEN 100
                                ELSE 0
                            END
                        ), 0) = $1
                        AND COUNT(DISTINCT fs.project_id) > $2
                    )
                ) ranked_users
            `;
            const frontendRankResult = await pool.query(frontendRankQuery, [userData.frontend_points, userData.projects_completed]);

            // Calculate Global Rank
            const globalRankQuery = `
                SELECT COUNT(*) + 1 as rank
                FROM (
                    SELECT 
                        u.id,
                        (COALESCE(dsa_stats.dsa_points, 0) + COALESCE(frontend_stats.frontend_points, 0)) as total_points,
                        COALESCE(dsa_stats.problems_solved, 0) as problems_solved,
                        COALESCE(frontend_stats.projects_completed, 0) as projects_completed
                    FROM users u
                    LEFT JOIN (
                        SELECT 
                            ups.user_id,
                            SUM(
                                CASE 
                                    WHEN p.difficulty = 'Easy' THEN 10
                                    WHEN p.difficulty = 'Medium' THEN 15
                                    WHEN p.difficulty = 'Hard' THEN 20
                                    ELSE 0
                                END
                            ) as dsa_points,
                            COUNT(DISTINCT ups.problem_id) as problems_solved
                        FROM user_problem_status ups
                        JOIN dsa_problems p ON ups.problem_id = p.id
                        WHERE ups.status = 'solved'
                        GROUP BY ups.user_id
                    ) dsa_stats ON u.id = dsa_stats.user_id
                    LEFT JOIN (
                        SELECT 
                            fs.user_id,
                            SUM(
                                CASE 
                                    WHEN fp.difficulty = 'Easy' THEN 50
                                    WHEN fp.difficulty = 'Medium' THEN 75
                                    WHEN fp.difficulty = 'Hard' THEN 100
                                    ELSE 0
                                END
                            ) as frontend_points,
                            COUNT(DISTINCT fs.project_id) as projects_completed
                        FROM frontend_submissions fs
                        JOIN frontend_projects fp ON fs.project_id = fp.id
                        WHERE fs.status = 'completed'
                        GROUP BY fs.user_id
                    ) frontend_stats ON u.id = frontend_stats.user_id
                    WHERE (COALESCE(dsa_stats.dsa_points, 0) + COALESCE(frontend_stats.frontend_points, 0)) > $1
                    OR (
                        (COALESCE(dsa_stats.dsa_points, 0) + COALESCE(frontend_stats.frontend_points, 0)) = $1
                        AND (COALESCE(dsa_stats.problems_solved, 0) + COALESCE(frontend_stats.projects_completed, 0)) > $2
                    )
                ) ranked_users
            `;
            const globalRankResult = await pool.query(globalRankQuery, [userData.total_points, userData.problems_solved + userData.projects_completed]);

            return {
                ...userData,
                dsa_rank: parseInt(dsaRankResult.rows[0].rank),
                frontend_rank: parseInt(frontendRankResult.rows[0].rank),
                global_rank: parseInt(globalRankResult.rows[0].rank)
            };
        } catch (error) {
            throw error;
        }
    }
}

export default Analytics;
