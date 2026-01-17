import pool from '../config/db.js';

class DsaProblem {
  // Get all problems with filters
  static async getAll(filters = {}) {
    try {
      let query = 'SELECT * FROM dsa_problems WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.difficulty) {
        query += ` AND difficulty = $${paramCount}`;
        values.push(filters.difficulty);
        paramCount++;
      }

      if (filters.tag) {
        query += ` AND $${paramCount} = ANY(tags)`;
        values.push(filters.tag);
        paramCount++;
      }

      if (filters.company) {
        query += ` AND $${paramCount} = ANY(companies)`;
        values.push(filters.company);
        paramCount++;
      }

      if (filters.search) {
        query += ` AND title ILIKE $${paramCount}`;
        values.push(`%${filters.search}%`);
        paramCount++;
      }

      query += ' ORDER BY id ASC';

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get problem by slug
  static async getBySlug(slug) {
    try {
      const query = 'SELECT * FROM dsa_problems WHERE slug = $1';
      const result = await pool.query(query, [slug]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get problem by ID
  static async getById(id) {
    try {
      const query = 'SELECT * FROM dsa_problems WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Submit solution
  static async submitSolution(userId, problemId, code, language, status, runtime, memory) {
    try {
      const query = `
        INSERT INTO user_submissions (user_id, problem_id, code, language, status, runtime, memory)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [userId, problemId, code, language, status, runtime, memory];
      const result = await pool.query(query, values);

      // Update problem stats
      if (status === 'Accepted') {
        await pool.query(
          'UPDATE dsa_problems SET total_accepted = total_accepted + 1, total_submissions = total_submissions + 1 WHERE id = $1',
          [problemId]
        );

        // Update user problem status
        await pool.query(
          `INSERT INTO user_problem_status (user_id, problem_id, status)
           VALUES ($1, $2, 'solved')
           ON CONFLICT (user_id, problem_id)
           DO UPDATE SET status = 'solved'`,
          [userId, problemId]
        );
      } else {
        await pool.query(
          'UPDATE dsa_problems SET total_submissions = total_submissions + 1 WHERE id = $1',
          [problemId]
        );

        await pool.query(
          `INSERT INTO user_problem_status (user_id, problem_id, status)
           VALUES ($1, $2, 'attempted')
           ON CONFLICT (user_id, problem_id)
           DO UPDATE SET status = CASE 
             WHEN user_problem_status.status = 'solved' THEN 'solved'
             ELSE 'attempted'
           END`,
          [userId, problemId]
        );
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get user's submission history for a problem
  static async getUserSubmissions(userId, problemId) {
    try {
      const query = `
        SELECT * FROM user_submissions 
        WHERE user_id = $1 AND problem_id = $2
        ORDER BY submitted_at DESC
      `;
      const result = await pool.query(query, [userId, problemId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get last accepted submission for a problem
  static async getLastAcceptedSubmission(userId, problemId) {
    try {
      const query = `
        SELECT * FROM user_submissions 
        WHERE user_id = $1 AND problem_id = $2 AND status = 'Accepted'
        ORDER BY submitted_at DESC
        LIMIT 1
      `;
      const result = await pool.query(query, [userId, problemId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get user's problem status
  static async getUserProblemStatus(userId, problemId) {
    try {
      const query = 'SELECT status FROM user_problem_status WHERE user_id = $1 AND problem_id = $2';
      const result = await pool.query(query, [userId, problemId]);
      return result.rows[0]?.status || null;
    } catch (error) {
      throw error;
    }
  }

  // Get user's solved problems count
  static async getUserStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'solved') as solved,
          COUNT(*) FILTER (WHERE status = 'attempted') as attempted
        FROM user_problem_status
        WHERE user_id = $1
      `;
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 🔥 NEW: Auto-save code (cloud saving like LeetCode)
  static async saveAutoSaveCode(userId, problemId, code, language) {
    try {
      const query = `
        INSERT INTO code_autosave (user_id, problem_id, code, language, saved_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, problem_id, language)
        DO UPDATE SET 
          code = $3,
          saved_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      const result = await pool.query(query, [userId, problemId, code, language]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 🔥 NEW: Get auto-saved code
  static async getAutoSavedCode(userId, problemId) {
    try {
      const query = `
        SELECT code, language, saved_at
        FROM code_autosave
        WHERE user_id = $1 AND problem_id = $2
        ORDER BY saved_at DESC
      `;
      const result = await pool.query(query, [userId, problemId]);

      // Return object with code for each language
      const autoSaved = {};
      result.rows.forEach(row => {
        autoSaved[row.language] = {
          code: row.code,
          savedAt: row.saved_at
        };
      });

      return autoSaved;
    } catch (error) {
      throw error;
    }
  }
}

export default DsaProblem;