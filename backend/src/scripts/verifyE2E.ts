import { createRemoteJWKSet, jwtVerify } from 'jose-cjs';
import path from 'path';
import dotenv from 'dotenv';
import { Course, Lecture } from '../types';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const port = process.env.PORT;
const clientUrl = process.env.CLIENT_URL;

if (!port || !clientUrl) {
  throw new Error('PORT and CLIENT_URL must be defined in backend environment variables');
}

const backendUrl = `http://localhost:${port}`;
const frontendUrl = clientUrl;

async function verifyAll(): Promise<void> {
  console.log('=================================================');
  console.log('  SPI LMS END-TO-END INTEGRATION TEST SUITE (TS)');
  console.log('=================================================\n');

  // 1. Test Backend Health & Neon DB connection
  console.log('[1/6] Testing Backend Health & Neon DB Connection...');
  const healthRes = await fetch(`${backendUrl}/api/health`);
  if (!healthRes.ok) throw new Error(`Backend health failed: ${healthRes.status}`);
  const healthJson = await healthRes.json();
  console.log('[OK] Backend is alive:', healthJson);

  // 2. Test Student Panel Course & Lecture Fetching
  console.log('\n[2/6] Testing Student Course Listing (Neon DB persistence)...');
  const coursesRes = await fetch(`${backendUrl}/api/courses`);
  const coursesData = await coursesRes.json();
  console.log(`[OK] Fetched ${coursesData.count} courses from Neon DB`);
  coursesData.data.forEach((c: Course) => {
    console.log(`   - Course #${c.id}: "${c.title}" ($${c.price}) [${c.lecture_count} lectures]`);
  });

  const sampleCourse = coursesData.data[0];
  console.log(`\n[3/6] Testing Student Lecture Details for Course #${sampleCourse.id}...`);
  const lecturesRes = await fetch(`${backendUrl}/api/courses/${sampleCourse.id}/lectures`);
  const lecturesData = await lecturesRes.json();
  console.log(`[OK] Fetched ${lecturesData.count} lectures for course "${sampleCourse.title}"`);
  lecturesData.data.forEach((l: Lecture) => {
    console.log(`   - Lecture #${l.id} [Order ${l.order_index}]: "${l.title}"`);
    console.log(`     Video Embed: ${l.video_url}`);
  });

  // 4. Test Frontend Better-Auth Login & JWT Generation
  console.log('\n[4/6] Testing Admin Authentication via Better-Auth...');
  const signInRes = await fetch(`${frontendUrl}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: frontendUrl },
    body: JSON.stringify({
      email: 'admin@spilms.com',
      password: 'AdminPassword123!'
    })
  });

  if (!signInRes.ok) {
    const errText = await signInRes.text();
    throw new Error(`Better-Auth sign-in failed: ${signInRes.status} ${errText}`);
  }

  const setCookie = signInRes.headers.get('set-cookie');
  console.log('[OK] Admin sign-in successful via Better-Auth!');

  const tokenRes = await fetch(`${frontendUrl}/api/auth/token`, {
    method: 'GET',
    headers: { Cookie: setCookie || '' }
  });

  let jwtToken: string | null = null;
  if (tokenRes.ok) {
    const tokenJson = await tokenRes.json();
    jwtToken = tokenJson.token;
  }

  if (!jwtToken) {
    throw new Error('Could not retrieve JWT token from Better-Auth');
  }
  console.log('[OK] Successfully retrieved JWT Token from Better-Auth:', jwtToken.substring(0, 30) + '...');

  // 5. Test Remote JWKS verification with jose-cjs
  console.log(`\n[5/6] Testing jose-cjs verification with remote JWKS (${frontendUrl}/api/auth/jwks)...`);
  const JWKS = createRemoteJWKSet(new URL(`${frontendUrl}/api/auth/jwks`));
  const { payload } = await jwtVerify(jwtToken, JWKS);
  console.log('[OK] jose-cjs verified token signature against remote JWKS successfully!');
  console.log('   Token Payload:', { sub: payload.sub, email: payload.email, name: payload.name });

  // 6. Test Admin CRUD with JWT on Backend
  console.log('\n[6/6] Testing Admin CRUD Operations on Backend with JWT Token...');

  // A. Create Course
  const createCourseRes = await fetch(`${backendUrl}/api/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`
    },
    body: JSON.stringify({
      title: 'Automated TypeScript E2E Test Course',
      description: 'Verifying dynamic course creation via authenticated Express TypeScript API.',
      price: 19.99,
      thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'
    })
  });
  const createdCourse = await createCourseRes.json();
  if (!createdCourse.success) throw new Error('Course creation failed: ' + JSON.stringify(createdCourse));
  console.log(`[OK] Admin created new course: ID ${createdCourse.data.id} - "${createdCourse.data.title}"`);

  // B. Add Lecture to Course
  const createLectureRes = await fetch(`${backendUrl}/api/courses/${createdCourse.data.id}/lectures`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`
    },
    body: JSON.stringify({
      title: 'TypeScript Test Lecture 1: Verifying Video Embed',
      description: 'Testing embedded YouTube video integration in TypeScript backend.',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      order_index: 1
    })
  });
  const createdLecture = await createLectureRes.json();
  if (!createdLecture.success) throw new Error('Lecture creation failed: ' + JSON.stringify(createdLecture));
  console.log(`[OK] Admin added lecture: ID ${createdLecture.data.id} - "${createdLecture.data.title}"`);

  // C. Update Course
  const updateCourseRes = await fetch(`${backendUrl}/api/courses/${createdCourse.data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`
    },
    body: JSON.stringify({
      title: 'Automated TypeScript E2E Test Course (Updated)',
      price: 24.99
    })
  });
  const updatedCourse = await updateCourseRes.json();
  console.log(`[OK] Admin updated course: "${updatedCourse.data.title}" ($${updatedCourse.data.price})`);

  // D. Delete Lecture
  const deleteLectureRes = await fetch(`${backendUrl}/api/lectures/${createdLecture.data.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${jwtToken}` }
  });
  const deletedLecture = await deleteLectureRes.json();
  console.log(`[OK] Admin deleted lecture: ID ${deletedLecture.data.id}`);

  // E. Delete Course
  const deleteCourseRes = await fetch(`${backendUrl}/api/courses/${createdCourse.data.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${jwtToken}` }
  });
  const deletedCourse = await deleteCourseRes.json();
  console.log(`[OK] Admin deleted course: ID ${deletedCourse.data.id}`);

  // F. Verify Unauthorized Protection
  const unauthTest = await fetch(`${backendUrl}/api/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hack Course' })
  });
  if (unauthTest.status === 401) {
    console.log('[OK] Route protection verified: Unauthorized request rejected with 401.');
  } else {
    throw new Error(`Expected 401 but got ${unauthTest.status}`);
  }

  console.log('\n=================================================');
  console.log('[SUCCESS] ALL TYPESCRIPT E2E VERIFICATION CHECKS PASSED!');
  console.log('=================================================');
}

verifyAll().catch((err) => {
  console.error('\n[ERROR] E2E Verification failed:', err);
  process.exit(1);
});

