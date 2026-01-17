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

// Initialize database tables
createUsersTable();
createUserProblemStatusTable();



export default pool;