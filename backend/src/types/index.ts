import { Request } from 'express';

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  lecture_count?: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Lecture {
  id: number;
  course_id: number;
  course_title?: string;
  title: string;
  description: string;
  video_url: string;
  order_index: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateCourseDto {
  title: string;
  description?: string;
  price?: number | string;
  thumbnail_url?: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  price?: number | string;
  thumbnail_url?: string;
}

export interface CreateLectureDto {
  course_id?: number | string;
  title: string;
  description?: string;
  video_url: string;
  order_index?: number | string;
}

export interface UpdateLectureDto {
  title?: string;
  description?: string;
  video_url?: string;
  order_index?: number | string;
}

export interface AuthUserPayload {
  sub: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

