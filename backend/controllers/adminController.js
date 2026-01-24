// controllers/adminController.js
import pool from '../config/db.js';
import DsaProblem from '../models/DsaProblem.js';
import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:userId/role
// @access  Admin
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [role, userId]
    );

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Toggle Prime membership
// @route   PUT /api/admin/users/:userId/prime
// @access  Admin
export const togglePrime = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isPrime } = req.body;

    await pool.query(
      'UPDATE users SET is_prime = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [isPrime, userId]
    );

    res.status(200).json({
      success: true,
      message: `Prime membership ${isPrime ? 'granted' : 'revoked'} successfully`,
    });
  } catch (error) {
    console.error('Toggle prime error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
// @access  Admin
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await User.delete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create new problem
// @route   POST /api/admin/problems
// @access  Admin
export const createProblem = async (req, res) => {
  try {
    const {
      title,
      slug,
      difficulty,
      description,
      examples,
      test_cases,
      tags,
      companies,
      is_premium,
      template_js,
      template_cpp,
      template_java,
      template_python,
      hints,
      constraints,
      acceptance,
      locked_testcases
    } = req.body;

    const query = `
      INSERT INTO dsa_problems (
        title, slug, difficulty, description, examples, test_cases,
        tags, companies, is_premium, template_js, template_cpp,
        template_java, template_python, hints, constraints, 
        acceptance, locked_testcases
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const result = await pool.query(query, [
      title,
      slug || title.toLowerCase().replace(/\s+/g, '-'),
      difficulty,
      description,
      JSON.stringify(examples),
      JSON.stringify(test_cases),
      tags,
      companies,
      is_premium || false,
      template_js,
      template_cpp,
      template_java,
      template_python,
      hints,
      constraints,
      acceptance || '0',
      locked_testcases || 3
    ]);

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      problem: result.rows[0],
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update problem
// @route   PUT /api/admin/problems/:problemId
// @access  Admin
export const updateProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        // Handle JSON fields
        if (["examples", "test_cases"].includes(key)) {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(updates[key]));
        }
        // Handle array fields
        else if (["tags", "companies"].includes(key)) {
          fields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
        }
        // Handle all other fields
        else {
          fields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(problemId);

    const query = `
      UPDATE dsa_problems 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      problem: result.rows[0],
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete problem
// @route   DELETE /api/admin/problems/:problemId
// @access  Admin
export const deleteProblem = async (req, res) => {
  try {
    const { problemId } = req.params;

    await pool.query('DELETE FROM dsa_problems WHERE id = $1', [problemId]);

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully',
    });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Admin
export const getStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE is_prime = true) as prime_users,
        (SELECT COUNT(*) FROM dsa_problems) as total_problems,
        (SELECT COUNT(*) FROM user_submissions) as total_submissions,
        (SELECT COUNT(*) FROM user_submissions WHERE status = 'Accepted') as accepted_submissions
    `);

    res.status(200).json({
      success: true,
      stats: stats.rows[0],
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};