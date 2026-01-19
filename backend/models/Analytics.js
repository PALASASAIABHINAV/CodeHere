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
}

export default Analytics;
