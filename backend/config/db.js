import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Create users table if not exists
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Users table created/verified');
  } catch (err) {
    console.error('❌ Error creating users table:', err);
  }
};

// Create user_problem_status table if not exists
const createUserProblemStatusTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_problem_status (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_id INTEGER NOT NULL,
      status VARCHAR(50) NOT NULL CHECK (status IN ('solved', 'attempted')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, problem_id)
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ User problem status table created/verified');
  } catch (err) {
    console.error('❌ Error creating user_problem_status table:', err);
  }
};

// Add profile picture fields to users table
const addProfilePictureFields = async () => {
  try {
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='profile_picture_url'
    `;
    const result = await pool.query(checkQuery);

    if (result.rows.length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN profile_picture_url VARCHAR(500),
        ADD COLUMN profile_picture_public_id VARCHAR(255),
        ADD COLUMN profile_picture_uploaded_at TIMESTAMP
      `);
      console.log('✅ Profile picture fields added to users table');
    }
  } catch (err) {
    console.error('❌ Error adding profile picture fields:', err);
  }
};

// Initialize database tables
createUsersTable();
createUserProblemStatusTable();

// Create submission_activity table if not exists (required for heatmap/stats)
const createSubmissionActivityTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS submission_activity (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      count INTEGER DEFAULT 0,
      UNIQUE(user_id, date)
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Submission activity table created/verified');
  } catch (err) {
    console.error('❌ Error creating submission_activity table:', err);
  }
};

createSubmissionActivityTable();
addProfilePictureFields();



export default pool;