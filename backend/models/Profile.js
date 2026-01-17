import pool from '../config/db.js';

class Profile {
    // Get profile by user ID
    static async getProfile(userId) {
        try {
            const query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.is_prime,
          u.profile_picture_url,
          u.bio,
          u.location,
          u.website,
          u.github_url,
          u.linkedin_url,
          u.created_at,
          COUNT(ups.id) FILTER (WHERE ups.status = 'solved') as solved_count,
          COUNT(ups.id) FILTER (WHERE ups.status = 'attempted') as attempted_count
        FROM users u
        LEFT JOIN user_problem_status ups ON u.id = ups.user_id
        WHERE u.id = $1
        GROUP BY u.id
      `;
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Get solved by difficulty
    static async getSolvedByDifficulty(userId) {
        try {
            const query = `
        SELECT 
          dp.difficulty,
          COUNT(*) as count
        FROM user_problem_status ups
        JOIN dsa_problems dp ON ups.problem_id = dp.id
        WHERE ups.user_id = $1 AND ups.status = 'solved'
        GROUP BY dp.difficulty
      `;
            const result = await pool.query(query, [userId]);

            const difficulties = { Easy: 0, Medium: 0, Hard: 0 };
            result.rows.forEach(row => {
                difficulties[row.difficulty] = parseInt(row.count);
            });

            return difficulties;
        } catch (error) {
            throw error;
        }
    }

    // Update streak
    static async updateStreak(userId) {
        try {
            const query = `
        SELECT DISTINCT DATE(submitted_at) as date
        FROM user_submissions
        WHERE user_id = $1 AND status = 'Accepted'
        ORDER BY date DESC
      `;
            const result = await pool.query(query, [userId]);

            if (result.rows.length === 0) {
                return { current_streak: 0, max_streak: 0 };
            }

            const dates = result.rows.map(row => new Date(row.date));
            let currentStreak = 0;
            let maxStreak = 0;
            let tempStreak = 1;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastDate = dates[0];
            const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

            if (daysDiff <= 1) {
                currentStreak = 1;

                for (let i = 1; i < dates.length; i++) {
                    const diff = Math.floor((dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24));
                    if (diff === 1) {
                        currentStreak++;
                        tempStreak++;
                    } else {
                        break;
                    }
                }
            }

            tempStreak = 1;
            for (let i = 1; i < dates.length; i++) {
                const diff = Math.floor((dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24));
                if (diff === 1) {
                    tempStreak++;
                    maxStreak = Math.max(maxStreak, tempStreak);
                } else {
                    tempStreak = 1;
                }
            }
            maxStreak = Math.max(maxStreak, currentStreak);

            return { current_streak: currentStreak, max_streak: maxStreak };
        } catch (error) {
            throw error;
        }
    }

    // Get streak
    static async getStreak(userId) {
        return await Profile.updateStreak(userId);
    }

    // Get heatmap data
    static async getHeatmapData(userId) {
        try {
            const query = `
        SELECT 
          DATE(submitted_at) as date,
          COUNT(*) as count
        FROM user_submissions
        WHERE user_id = $1 AND status = 'Accepted'
        GROUP BY DATE(submitted_at)
        ORDER BY date DESC
        LIMIT 365
      `;
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Update profile
    static async updateProfile(userId, data) {
        try {
            const { bio, location, website, github_url, linkedin_url } = data;

            const query = `
        UPDATE users
        SET 
          bio = COALESCE($1, bio),
          location = COALESCE($2, location),
          website = COALESCE($3, website),
          github_url = COALESCE($4, github_url),
          linkedin_url = COALESCE($5, linkedin_url),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING id, name, email, bio, location, website, github_url, linkedin_url
      `;

            const result = await pool.query(query, [
                bio,
                location,
                website,
                github_url,
                linkedin_url,
                userId
            ]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

export default Profile;
