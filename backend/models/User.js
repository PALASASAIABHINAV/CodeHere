import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

class User {
  // Create a new user
  static async create(name, email, password) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const query = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, role, is_prime, created_at
      `;

      const values = [name, email, hashedPassword];
      const result = await pool.query(query, values);

      // Create user profile
      await pool.query(
        'INSERT INTO user_profiles (user_id) VALUES ($1)',
        [result.rows[0].id]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = 'SELECT id, name, email, role, is_prime, profile_picture_url, created_at FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Compare password for login
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get all users (for admin)
  static async getAll() {
    try {
      const query = `
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.role, 
          u.is_prime, 
          u.created_at,
          COUNT(DISTINCT ups.problem_id) FILTER (WHERE ups.status = 'solved') as solved_count
        FROM users u
        LEFT JOIN user_problem_status ups ON u.id = ups.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `;
      const result = await pool.query(query);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, name, email) {
    try {
      const query = `
        UPDATE users 
        SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, name, email, role, is_prime, updated_at
      `;

      const values = [name, email, id];
      const result = await pool.query(query, values);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update password
  static async updatePassword(id, hashedPassword) {
    try {
      const query = `
        UPDATE users 
        SET password = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;

      await pool.query(query, [hashedPassword, id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const query = 'DELETE FROM users WHERE id = $1';
      await pool.query(query, [id]);

      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default User;