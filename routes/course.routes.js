import express from 'express';
import { listContent, getContentById, enrollInCourse, getMyCourses, getPaymentStatus, accessCourseContent, getAvailableCourses } from '../controllers/content.controller.js';
import { getCourseModules, getCourseProgress, updateLessonProgress } from '../controllers/module.controller.js';
import { protect, isAuthenticatedOptional } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas públicas
router.get('/', (req, res, next) => {
    req.query.type = 'course';
    listContent(req, res, next);
});
router.get('/:id', isAuthenticatedOptional, getContentById);

// Rotas protegidas
router.get('/available', isAuthenticatedOptional, getAvailableCourses);
router.get('/my/enrolled', protect, getMyCourses);
router.post('/:id/enroll', protect, enrollInCourse);
router.get('/:id/access', protect, accessCourseContent);
router.get('/:id/payment-status', protect, getPaymentStatus);

export default router;