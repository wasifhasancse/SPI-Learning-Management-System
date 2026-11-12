import { Request, Response } from 'express';
import LectureModel from '../models/lectureModel';
import CourseModel from '../models/courseModel';
import { Lecture, CreateLectureDto, UpdateLectureDto } from '../types';

export const LectureController = {
  /**
   * Get all lectures across all courses (or filtered by courseId query)
   * GET /api/lectures
   */
  async getAllLectures(req: Request, res: Response): Promise<Response> {
    try {
      const { courseId } = req.query;
      let lectures: Lecture[];
      if (courseId) {
        lectures = await LectureModel.findByCourseId(String(courseId));
      } else {
        lectures = await LectureModel.findAll();
      }
      return res.status(200).json({
        success: true,
        count: lectures.length,
        data: lectures
      });
    } catch (error: any) {
      console.error('Error fetching all lectures:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching lectures',
        error: error.message
      });
    }
  },

  /**
   * Get all lectures for a specific course
   * GET /api/courses/:courseId/lectures
   */
  async getLecturesByCourse(req: Request<{ courseId: string }>, res: Response): Promise<Response> {
    try {
      const { courseId } = req.params;

      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Course with ID ${courseId} not found`
        });
      }

      const lectures = await LectureModel.findByCourseId(courseId);
      return res.status(200).json({
        success: true,
        course: {
          id: course.id,
          title: course.title
        },
        count: lectures.length,
        data: lectures
      });
    } catch (error: any) {
      console.error(`Error fetching lectures for course ${req.params.courseId}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching lectures',
        error: error.message
      });
    }
  },

  /**
   * Get a single lecture by ID
   * GET /api/lectures/:id
   */
  async getLectureById(req: Request<{ id: string }>, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const lecture = await LectureModel.findById(id);

      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: `Lecture with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        data: lecture
      });
    } catch (error: any) {
      console.error(`Error fetching lecture ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching lecture',
        error: error.message
      });
    }
  },

  /**
   * Create a new lecture for a course
   * POST /api/courses/:courseId/lectures or POST /api/lectures
   */
  async createLecture(
    req: Request<{ courseId?: string }, {}, CreateLectureDto>,
    res: Response
  ): Promise<Response> {
    try {
      const courseId = req.params.courseId || req.body.course_id;
      const { title, description, video_url, order_index } = req.body;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required.'
        });
      }

      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Course with ID ${courseId} not found`
        });
      }

      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Lecture title is required and must be non-empty.'
        });
      }

      if (!video_url || typeof video_url !== 'string' || !video_url.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Video URL is required and must be non-empty.'
        });
      }

      const newLecture = await LectureModel.create({
        course_id: courseId,
        title: title.trim(),
        description: description ? description.trim() : '',
        video_url: video_url.trim(),
        order_index: order_index !== undefined ? parseInt(order_index.toString(), 10) : undefined
      });

      return res.status(201).json({
        success: true,
        message: 'Lecture created successfully',
        data: newLecture
      });
    } catch (error: any) {
      console.error('Error creating lecture:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while creating lecture',
        error: error.message
      });
    }
  },

  /**
   * Update an existing lecture
   * PUT /api/lectures/:id
   */
  async updateLecture(
    req: Request<{ id: string }, {}, UpdateLectureDto>,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;
      const { title, description, video_url, order_index } = req.body;

      const existing = await LectureModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Lecture with ID ${id} not found`
        });
      }

      if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
        return res.status(400).json({
          success: false,
          message: 'If provided, lecture title must be a non-empty string.'
        });
      }

      if (video_url !== undefined && (typeof video_url !== 'string' || !video_url.trim())) {
        return res.status(400).json({
          success: false,
          message: 'If provided, video URL must be a non-empty string.'
        });
      }

      const updated = await LectureModel.update(id, {
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? description.trim() : existing.description,
        video_url: video_url !== undefined ? video_url.trim() : existing.video_url,
        order_index: order_index !== undefined ? parseInt(order_index.toString(), 10) : existing.order_index
      });

      return res.status(200).json({
        success: true,
        message: 'Lecture updated successfully',
        data: updated
      });
    } catch (error: any) {
      console.error(`Error updating lecture ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while updating lecture',
        error: error.message
      });
    }
  },

  /**
   * Delete a lecture
   * DELETE /api/lectures/:id
   */
  async deleteLecture(req: Request<{ id: string }>, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const deleted = await LectureModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Lecture with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Lecture deleted successfully',
        data: deleted
      });
    } catch (error: any) {
      console.error(`Error deleting lecture ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while deleting lecture',
        error: error.message
      });
    }
  }
};

export default LectureController;

