const API_BASE_URL = process.env.SERVER_URL;

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number | string;
  thumbnail_url: string;
  lecture_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Lecture {
  id: number;
  course_id: number;
  course_title?: string;
  title: string;
  description: string;
  video_url: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  error?: string;
}

/**
 * Fetch JWT token for currently authenticated session
 */
export async function getJwtToken(): Promise<string | null> {
  const res = await fetch('/api/auth/token', {
    method: 'GET',
    credentials: 'include'
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Could not create an authorization token (HTTP ${res.status}). Please contact an administrator.`);
  const data = await res.json();
  if (typeof data.token !== 'string' || !data.token) {
    throw new Error('The authorization service returned an invalid token.');
  }
  return data.token;
}

/**
 * Get all courses
 */
export async function fetchCourses(): Promise<Course[]> {
  if (!API_BASE_URL) throw new Error('SERVER_URL is not configured.');
  const res = await fetch(`${API_BASE_URL}/api/courses`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load courses (HTTP ${res.status}).`);
  const json: ApiResponse<Course[]> = await res.json();
  if (!json.success || !Array.isArray(json.data)) throw new Error(json.message || 'Invalid courses response.');
  return json.data;
}

/**
 * Get course by ID
 */
export async function fetchCourseById(id: number | string): Promise<Course | null> {
  if (!API_BASE_URL) throw new Error('SERVER_URL is not configured.');
  const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load course (HTTP ${res.status}).`);
  const json: ApiResponse<Course> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message || 'Invalid course response.');
  return json.data;
}

/**
 * Get all lectures across all courses (or filtered by courseId query)
 */
export async function fetchLectures(courseId?: number | string): Promise<Lecture[]> {
  if (!API_BASE_URL) throw new Error('SERVER_URL is not configured.');
  const url = courseId
    ? `${API_BASE_URL}/api/lectures?courseId=${courseId}`
    : `${API_BASE_URL}/api/lectures`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load lectures (HTTP ${res.status}).`);
  const json: ApiResponse<Lecture[]> = await res.json();
  if (!json.success || !Array.isArray(json.data)) throw new Error(json.message || 'Invalid lectures response.');
  return json.data;
}

/**
 * Get all lectures for a course
 */
export async function fetchLecturesByCourse(courseId: number | string): Promise<Lecture[]> {
  if (!API_BASE_URL) throw new Error('SERVER_URL is not configured.');
  const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/lectures`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load course lectures (HTTP ${res.status}).`);
  const json: ApiResponse<Lecture[]> = await res.json();
  if (!json.success || !Array.isArray(json.data)) throw new Error(json.message || 'Invalid lectures response.');
  return json.data;
}

/**
 * Get single lecture by ID
 */
export async function fetchLectureById(id: number | string): Promise<Lecture | null> {
  try {
    if (!API_BASE_URL) {
      return null;
    }
    const res = await fetch(`${API_BASE_URL}/api/lectures/${id}`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      return null;
    }
    const json: ApiResponse<Lecture> = await res.json();
    return json.data || null;
  } catch (err: any) {
    console.warn(`Unable to fetch lecture ${id}:`, err.message);
    return null;
  }
}

/**
 * Create course (Admin)
 */
export async function createCourse(
  courseData: Partial<Course>,
  token: string
): Promise<Course> {
  if (!API_BASE_URL) {
    throw new Error('SERVER_URL is not configured.');
  }
  const res = await fetch(`${API_BASE_URL}/api/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(courseData)
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to create course');
  }
  return json.data;
}

/**
 * Update course (Admin)
 */
export async function updateCourse(
  id: number | string,
  courseData: Partial<Course>,
  token: string
): Promise<Course> {
  if (!API_BASE_URL) {
    throw new Error('SERVER_URL is not configured.');
  }
  const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(courseData)
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to update course');
  }
  return json.data;
}

/**
 * Delete course (Admin)
 */
export async function deleteCourse(
  id: number | string,
  token: string
): Promise<Course> {
  if (!API_BASE_URL) {
    throw new Error('SERVER_URL is not configured.');
  }
  const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to delete course');
  }
  return json.data;
}

/**
 * Create lecture for course (Admin)
 */
export async function createLecture(
  courseId: number | string,
  lectureData: Partial<Lecture>,
  token: string
): Promise<Lecture> {
  if (!API_BASE_URL) {
    throw new Error('SERVER_URL is not configured.');
  }
  const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/lectures`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(lectureData)
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to create lecture');
  }
  return json.data;
}

/**
 * Update lecture (Admin)
 */
export async function updateLecture(
  id: number | string,
  lectureData: Partial<Lecture>,
  token: string
): Promise<Lecture> {
  if (!API_BASE_URL) {
    throw new Error('SERVER_URL is not configured.');
  }
  const res = await fetch(`${API_BASE_URL}/api/lectures/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(lectureData)
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to update lecture');
  }
  return json.data;
}

/**
 * Delete lecture (Admin)
 */
export async function deleteLecture(
  id: number | string,
  token: string
): Promise<Lecture> {
  if (!API_BASE_URL) {
    throw new Error('SERVER_URL is not configured.');
  }
  const res = await fetch(`${API_BASE_URL}/api/lectures/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to delete lecture');
  }
  return json.data;
}
