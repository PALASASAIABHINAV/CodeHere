import pool from '../config/db.js';

class FrontendProject {
  static async getAll(userId = null) {
    let query;
    let params = [];

    if (userId) {
      query = `
                SELECT fp.*, 
                CASE WHEN fs.status = 'completed' THEN true ELSE false END as is_completed
                FROM frontend_projects fp
                LEFT JOIN frontend_submissions fs ON fp.id = fs.project_id AND fs.user_id = $1
                ORDER BY fp.id ASC
            `;
      params = [userId];
    } else {
      query = `
                SELECT id, title, slug, description, difficulty, tags, created_at, false as is_completed
                FROM frontend_projects
                ORDER BY id ASC
            `;
    }

    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async getBySlug(slug, userId = null) {
    let query = `
      SELECT * FROM frontend_projects WHERE slug = $1
    `;
    let params = [slug];

    if (userId) {
      query = `
        SELECT fp.*, fs.status as user_status, fs.submission_code as saved_code
        FROM frontend_projects fp
        LEFT JOIN frontend_submissions fs ON fp.id = fs.project_id AND fs.user_id = $2
        WHERE fp.slug = $1
      `;
      params = [slug, userId];
    }

    const { rows } = await pool.query(query, params);
    return rows[0];
  }

  static async saveProgress(userId, projectId, code) {
    const query = `
      INSERT INTO frontend_submissions (user_id, project_id, submission_code, status)
      VALUES ($1, $2, $3, 'in_progress')
      ON CONFLICT (user_id, project_id)
      DO UPDATE SET 
        submission_code = $3,
        created_at = CURRENT_TIMESTAMP
    `;
    const { rows } = await pool.query(query, [userId, projectId, code]);
    return rows[0];
  }
}

export default FrontendProject;
