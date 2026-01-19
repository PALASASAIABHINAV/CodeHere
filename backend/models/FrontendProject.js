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

  // Admin CRUD Methods
  static async create(projectData) {
    const { title, slug, description, difficulty, tags, requirements, expected_solution_url, starter_html, starter_css, starter_js } = projectData;

    // Ensure requirements is JSON stringified if it's an array/object
    const requirementsJson = typeof requirements === 'string' ? requirements : JSON.stringify(requirements || []);

    const query = `
      INSERT INTO frontend_projects 
      (title, slug, description, difficulty, tags, requirements, expected_solution_url, starter_html, starter_css, starter_js)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [title, slug, description, difficulty, tags, requirementsJson, expected_solution_url, starter_html, starter_css, starter_js]);
    return rows[0];
  }

  static async update(id, projectData) {
    const { title, slug, description, difficulty, tags, requirements, expected_solution_url, starter_html, starter_css, starter_js } = projectData;

    // Ensure requirements is JSON stringified if it's an array/object
    const requirementsJson = typeof requirements === 'string' ? requirements : JSON.stringify(requirements || []);

    const query = `
      UPDATE frontend_projects SET
      title = $1, slug = $2, description = $3, difficulty = $4, tags = $5, requirements = $6, expected_solution_url = $7, starter_html = $8, starter_css = $9, starter_js = $10
      WHERE id = $11
      RETURNING *
    `;
    const { rows } = await pool.query(query, [title, slug, description, difficulty, tags, requirementsJson, expected_solution_url, starter_html, starter_css, starter_js, id]);
    return rows[0];
  }

  static async delete(id) {
    // First delete associated submissions/progress
    await pool.query('DELETE FROM frontend_submissions WHERE project_id = $1', [id]);

    // Then delete the project
    const query = `DELETE FROM frontend_projects WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

export default FrontendProject;
