// models/Profile.js
import pool from '../config/db.js';

class Profile {
  // Get user profile with stats
  static async getProfile(userId) {
    try {
      const query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          u.is_prime,
          u.avatar_url,
          u.bio,
          u.location,
          u.website,
          u.github_url,
          u.linkedin_url,
          u.created_at,
          up.education,
          up.skills,
          up.experience,
          up.certifications,
          up.current_streak,
          up.max_streak,
          up.rank,
          up.points,
          COUNT(DISTINCT CASE WHEN ups.status = 'solved' THEN ups.problem_id END) as solved_count,
          COUNT(DISTINCT CASE WHEN ups.status = 'attempted' THEN ups.problem_id END) as attempted_count,
          COUNT(DISTINCT us.id) as total_submissions
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN user_problem_status ups ON u.id = ups.user_id
        LEFT JOIN user_submissions us ON u.id = us.user_id
        WHERE u.id = $1
        GROUP BY u.id, up.user_id, up.education, up.skills, up.experience, 
                 up.certifications, up.current_streak, up.max_streak, up.rank, up.points
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(userId, profileData) {
    try {
      const {
        name,
        bio,
        location,
        website,
        github_url,
        linkedin_url,
        education,
        skills,
        experience,
        certifications
      } = profileData;

      // Update users table
      await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             bio = COALESCE($2, bio),
             location = COALESCE($3, location),
             website = COALESCE($4, website),
             github_url = COALESCE($5, github_url),
             linkedin_url = COALESCE($6, linkedin_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7`,
        [name, bio, location, website, github_url, linkedin_url, userId]
      );

      // Update user_profiles table
      await pool.query(
        `INSERT INTO user_profiles (user_id, education, skills, experience, certifications)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           education = COALESCE($2, user_profiles.education),
           skills = COALESCE($3, user_profiles.skills),
           experience = COALESCE($4, user_profiles.experience),
           certifications = COALESCE($5, user_profiles.certifications),
           updated_at = CURRENT_TIMESTAMP`,
        [userId, education, skills, experience, certifications]
      );

      return await this.getProfile(userId);
    } catch (error) {
      throw error;
    }
  }

  // Get submission heatmap data
  static async getHeatmapData(userId) {
    try {
      const query = `
        SELECT date, count
        FROM submission_activity
        WHERE user_id = $1
        AND date >= CURRENT_DATE - INTERVAL '1 year'
        ORDER BY date ASC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get user's solved problems by difficulty
  static async getSolvedByDifficulty(userId) {
    try {
      const query = `
        SELECT 
          dp.difficulty,
          COUNT(DISTINCT ups.problem_id) as count
        FROM user_problem_status ups
        JOIN dsa_problems dp ON ups.problem_id = dp.id
        WHERE ups.user_id = $1 AND ups.status = 'solved'
        GROUP BY dp.difficulty
      `;
      
      const result = await pool.query(query, [userId]);
      
      const stats = {
        Easy: 0,
        Medium: 0,
        Hard: 0
      };
      
      result.rows.forEach(row => {
        stats[row.difficulty] = parseInt(row.count);
      });
      
      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Get streak data (for public profiles)
  static async getStreak(userId) {
    try {
      const query = `
        SELECT current_streak, max_streak
        FROM user_profiles
        WHERE user_id = $1
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows[0] || { current_streak: 0, max_streak: 0 };
    } catch (error) {
      throw error;
    }
  }

  // Calculate and update user streak
  static async updateStreak(userId) {
    try {
      const query = `
        WITH daily_submissions AS (
          SELECT DISTINCT DATE(submitted_at) as submission_date
          FROM user_submissions
          WHERE user_id = $1
          ORDER BY submission_date DESC
        ),
        streak_calc AS (
          SELECT 
            submission_date,
            submission_date - ROW_NUMBER() OVER (ORDER BY submission_date DESC)::INTEGER as streak_group
          FROM daily_submissions
        ),
        current_streak AS (
          SELECT COUNT(*) as streak
          FROM streak_calc
          WHERE streak_group = (
            SELECT streak_group 
            FROM streak_calc 
            WHERE submission_date = CURRENT_DATE
            LIMIT 1
          )
        ),
        max_streak AS (
          SELECT MAX(streak_count) as max_streak
          FROM (
            SELECT COUNT(*) as streak_count
            FROM streak_calc
            GROUP BY streak_group
          ) subq
        )
        SELECT 
          COALESCE((SELECT streak FROM current_streak), 0) as current_streak,
          COALESCE((SELECT max_streak FROM max_streak), 0) as max_streak
      `;
      
      const result = await pool.query(query, [userId]);
      const { current_streak, max_streak } = result.rows[0];
      
      // Update user_profiles
      await pool.query(
        `INSERT INTO user_profiles (user_id, current_streak, max_streak)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id)
         DO UPDATE SET 
           current_streak = $2,
           max_streak = GREATEST(user_profiles.max_streak, $3)`,
        [userId, current_streak, max_streak]
      );
      
      return { current_streak, max_streak };
    } catch (error) {
      throw error;
    }
  }
}

export default Profile;