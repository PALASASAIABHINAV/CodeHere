import pool from '../config/db.js';

class FrontendSubmission {
  static async create({ userId, projectId, code, status = 'completed' }) {
    const query = `
      INSERT INTO frontend_submissions (user_id, project_id, submission_code, status)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, project_id) 
      DO UPDATE SET 
        submission_code = EXCLUDED.submission_code,
        status = CASE WHEN frontend_submissions.status = 'completed' THEN 'completed' ELSE EXCLUDED.status END,
        created_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const { rows } = await pool.query(query, [userId, projectId, code, status]);
    return rows[0];
  }

  static async getByUserAndProject(userId, projectId) {
    const query = `
      SELECT * FROM frontend_submissions
      WHERE user_id = $1 AND project_id = $2
    `;
    const { rows } = await pool.query(query, [userId, projectId]);
    return rows[0];
  }
}

export default FrontendSubmission;
