import { Router } from 'express';
import LectureController from '../controllers/lectureController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router({ mergeParams: true });

// Nested under courses: /api/courses/:courseId/lectures
router.get('/', (req, res) => {
  LectureController.getLecturesByCourse(req as any, res);
});
router.post('/', requireAuth, (req, res) => {
  LectureController.createLecture(req as any, res);
});

export default router;

