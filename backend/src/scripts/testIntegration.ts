import { pool } from '../config/db';
import { CourseModel } from '../models/courseModel';
import { LectureModel } from '../models/lectureModel';

async function runDirectVerification() {
  console.log('--- DIRECT DATABASE & MVC VERIFICATION ---');
  
  // 1. Database Connection check
  const ping = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
  console.log('[OK] Connected to Neon DB:', ping.rows[0].db_name, 'at', ping.rows[0].current_time);

  // 2. Course Model queries
  const allCourses = await CourseModel.findAll();
  console.log(`[OK] Course Model retrieved ${allCourses.length} courses from Neon DB:`);
  allCourses.forEach((c) => {
    console.log(`  - [ID ${c.id}] ${c.title} (Price: $${c.price}) [${c.lecture_count} lectures]`);
  });

  if (allCourses.length > 0) {
    const firstCourse = allCourses[0];
    const lectures = await LectureModel.findByCourseId(firstCourse.id);
    console.log(`[OK] Lecture Model retrieved ${lectures.length} lectures for course "${firstCourse.title}":`);
    lectures.forEach((l) => {
      console.log(`  - [ID ${l.id}] [Order ${l.order_index}] ${l.title}`);
    });
  }

  // 3. Test Course Creation, Retrieval, and Deletion via Model (CRUD)
  console.log('Testing Course CRUD operations in Neon DB...');
  const testCourse = await CourseModel.create({
    title: 'Automated Test Course',
    description: 'Verifying database persistence in Neon PostgreSQL',
    price: 19.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'
  });
  console.log(`[OK] Created temporary course with ID ${testCourse.id}`);

  const testLecture = await LectureModel.create({
    course_id: testCourse.id,
    title: 'Automated Test Lecture',
    description: 'Verifying lecture attachment and order index',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    order_index: 1
  });
  console.log(`[OK] Created temporary lecture with ID ${testLecture.id}`);

  // Clean up
  await LectureModel.delete(testLecture.id);
  console.log(`[OK] Cleaned up temporary lecture`);
  await CourseModel.delete(testCourse.id);
  console.log(`[OK] Cleaned up temporary course`);

  console.log('--- ALL INTEGRATION & MODEL TESTS PASSED CLEANLY ---');
  await pool.end();
}

runDirectVerification().catch((err) => {
  console.error('[FAIL] Verification encountered an error:', err);
  process.exit(1);
});
