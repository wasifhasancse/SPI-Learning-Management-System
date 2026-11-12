import { pool } from '../config/db';

async function seed(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('Starting database seeding...');

    // Clean existing records if any
    await client.query('DELETE FROM lectures;');
    await client.query('DELETE FROM courses;');

    // 1. Insert Courses
    const course1Res = await client.query<{ id: number }>(`
      INSERT INTO courses (title, description, price, thumbnail_url)
      VALUES (
        'Complete Next.js & React Full-Stack Masterclass',
        'Learn Next.js 16, React 19, TypeScript, and modern web application development from scratch. Build production-ready applications with clean architecture and responsive UI.',
        49.99,
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80'
      ) RETURNING id;
    `);
    const course1Id = course1Res.rows[0].id;

    const course2Res = await client.query<{ id: number }>(`
      INSERT INTO courses (title, description, price, thumbnail_url)
      VALUES (
        'Mastering Node.js, Express & PostgreSQL MVC Architecture',
        'Deep dive into building scalable, secure backend APIs using TypeScript, Express.js, PostgreSQL with Neon DB, and clean MVC architecture.',
        39.99,
        'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80'
      ) RETURNING id;
    `);
    const course2Id = course2Res.rows[0].id;

    const course3Res = await client.query<{ id: number }>(`
      INSERT INTO courses (title, description, price, thumbnail_url)
      VALUES (
        'Tailwind CSS & Modern Responsive UI Design',
        'Master modern CSS styling, custom color palettes, accessible component design, and mobile-first layouts with Tailwind CSS.',
        29.99,
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'
      ) RETURNING id;
    `);
    const course3Id = course3Res.rows[0].id;

    // 2. Insert Lectures for Course 1
    await client.query(`
      INSERT INTO lectures (course_id, title, description, video_url, order_index)
      VALUES 
      (
        $1,
        '1. Introduction to Next.js App Router and Architecture',
        'Overview of Next.js project structure, file-based routing, server vs client components, and key architectural decisions.',
        'https://www.youtube.com/watch?v=wm5gMKuwSYk',
        1
      ),
      (
        $1,
        '2. Server Components, Client Components and Hydration',
        'Learn when and how to use server components, client components, and prevent hydration mismatches.',
        'https://www.youtube.com/watch?v=RBM03RihZVs',
        2
      ),
      (
        $1,
        '3. Data Fetching and Dynamic Route Handlers',
        'Master API routes, dynamic params, search params, and loading skeletons.',
        'https://www.youtube.com/watch?v=gSSsZReIFRk',
        3
      );
    `, [course1Id]);

    // Insert Lectures for Course 2
    await client.query(`
      INSERT INTO lectures (course_id, title, description, video_url, order_index)
      VALUES 
      (
        $1,
        '1. Setting Up MVC Pattern in Express.js with TypeScript',
        'Structuring controllers, models, routes, and middlewares for clean maintainability.',
        'https://www.youtube.com/watch?v=CnH3kAXSrmU',
        1
      ),
      (
        $1,
        '2. Connecting to Neon PostgreSQL and Pool Management',
        'Database connections, secure SSL credentials, and parameterized SQL queries.',
        'https://www.youtube.com/watch?v=qw--VYLpxG4',
        2
      ),
      (
        $1,
        '3. JWT Authentication & JWKS Verification',
        'Verifying JSON Web Tokens in Express middleware using jose-cjs and remote JWKS.',
        'https://www.youtube.com/watch?v=7Q17ubqL20o',
        3
      );
    `, [course2Id]);

    // Insert Lectures for Course 3
    await client.query(`
      INSERT INTO lectures (course_id, title, description, video_url, order_index)
      VALUES 
      (
        $1,
        '1. Custom Color Tokens & Global CSS Setup',
        'Setting up CSS variables, custom theme colors (#A8DF8E, #F0FFDF, #FFD8DF, #FFAAB8, #FFFFFF), and fonts.',
        'https://www.youtube.com/watch?v=ft30zcMlFao',
        1
      ),
      (
        $1,
        '2. Responsive Flexbox & Grid Systems',
        'Building adaptive layouts for desktop, tablet, and mobile screens.',
        'https://www.youtube.com/watch?v=2ms3O_qZ1B0',
        2
      );
    `, [course3Id]);

    console.log('[OK] Successfully seeded courses and lectures into Neon DB!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

