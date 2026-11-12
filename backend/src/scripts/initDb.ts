import { pool } from '../config/db';

async function initDb(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('Connected to Neon PostgreSQL database.');
    console.log('Initializing database tables...');

    // 1. Create courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        thumbnail_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[OK] "courses" table ready.');

    // 2. Create lectures table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lectures (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url TEXT NOT NULL,
        order_index INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[OK] "lectures" table ready.');

    // Create index on course_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_lectures_course_id ON lectures(course_id);
    `);
    console.log('[OK] Indexes verified.');

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDb();

