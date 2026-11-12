import { Request, Response } from 'express';
import CourseModel from '../models/courseModel';
import { CreateCourseDto, UpdateCourseDto } from '../types';

export const CourseController = {
  /**
   * Get all courses with lecture counts
   * GET /api/courses
   */
  async getAllCourses(req: Request, res: Response): Promise<Response> {
    try {
      const courses = await CourseModel.findAll();
      return res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      });
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching courses',
        error: error.message
      });
    }
  },

  /**
   * Get a single course by ID
   * GET /api/courses/:id
   */
  async getCourseById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Course with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        data: course
      });
    } catch (error: any) {
      console.error(`Error fetching course ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching course details',
        error: error.message
      });
    }
  },

  /**
   * Create a new course
   * POST /api/courses
   */
  async createCourse(req: Request<{}, {}, CreateCourseDto>, res: Response): Promise<Response> {
    try {
      const { title, description, price, thumbnail_url } = req.body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Course title is required and must be non-empty.'
        });
      }

      const parsedPrice = price !== undefined ? parseFloat(price.toString()) : 0;
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid positive number.'
        });
      }

      const newCourse = await CourseModel.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        price: parsedPrice,
        thumbnail_url: thumbnail_url ? thumbnail_url.trim() : ''
      });

      return res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: newCourse
      });
    } catch (error: any) {
      console.error('Error creating course:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while creating course',
        error: error.message
      });
    }
  },

  /**
   * Update an existing course
   * PUT /api/courses/:id
   */
  async updateCourse(req: Request<{ id: string }, {}, UpdateCourseDto>, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { title, description, price, thumbnail_url } = req.body;

      const existing = await CourseModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Course with ID ${id} not found`
        });
      }

      if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
        return res.status(400).json({
          success: false,
          message: 'If provided, course title must be a non-empty string.'
        });
      }

      let parsedPrice = existing.price;
      if (price !== undefined) {
        parsedPrice = parseFloat(price.toString());
        if (isNaN(parsedPrice) || parsedPrice < 0) {
          return res.status(400).json({
            success: false,
            message: 'Price must be a valid positive number.'
          });
        }
      }

      const updated = await CourseModel.update(id, {
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? description.trim() : existing.description,
        price: parsedPrice,
        thumbnail_url: thumbnail_url !== undefined ? thumbnail_url.trim() : existing.thumbnail_url
      });

      return res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: updated
      });
    } catch (error: any) {
      console.error(`Error updating course ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while updating course',
        error: error.message
      });
    }
  },

  /**
   * Delete a course
   * DELETE /api/courses/:id
   */
  async deleteCourse(req: Request<{ id: string }>, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const deleted = await CourseModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Course with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Course and associated lectures deleted successfully',
        data: deleted
      });
    } catch (error: any) {
      console.error(`Error deleting course ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while deleting course',
        error: error.message
      });
    }
  }
};

export default CourseController;

