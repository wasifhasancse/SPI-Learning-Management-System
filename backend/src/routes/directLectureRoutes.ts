import { Router } from 'express';
import LectureController from '../controllers/lectureController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Collection routes: /api/lectures
router.get('/', (req, res) => {
  LectureController.getAllLectures(req as any, res);
});
router.post('/', requireAuth, (req, res) => {
  LectureController.createLecture(req as any, res);
});

// Direct member routes: /api/lectures/:id
router.get('/:id', (req, res) => {
  LectureController.getLectureById(req as any, res);
});
router.put('/:id', requireAuth, (req, res) => {
  LectureController.updateLecture(req as any, res);
});
router.delete('/:id', requireAuth, (req, res) => {
  LectureController.deleteLecture(req as any, res);
});

export default router;

