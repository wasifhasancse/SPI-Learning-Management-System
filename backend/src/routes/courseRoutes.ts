import { Router } from 'express';
import CourseController from '../controllers/courseController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.get('/', (req, res) => {
  CourseController.getAllCourses(req, res);
});
router.get('/:id', (req, res) => {
  CourseController.getCourseById(req, res);
});

// Admin-protected routes
router.post('/', requireAuth, (req, res) => {
  CourseController.createCourse(req as any, res);
});
router.put('/:id', requireAuth, (req, res) => {
  CourseController.updateCourse(req as any, res);
});
router.delete('/:id', requireAuth, (req, res) => {
  CourseController.deleteCourse(req as any, res);
});

export default router;
