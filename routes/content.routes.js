import express from 'express';
import { listContent, getContentById, enrollInCourse, getMyCourses, getPaymentStatus, accessCourseContent, getAvailableCourses } from '../controllers/content.controller.js';
import { getCourseModules, getCourseProgress, updateLessonProgress } from '../controllers/module.controller.js';
import { protect, isAuthenticatedOptional } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas públicas (com autenticação opcional para verificar inscrição)
router.get('/', listContent);
router.get('/:id', isAuthenticatedOptional, getContentById);

// Rotas protegidas
router.get('/available', protect, getAvailableCourses);
router.get('/my-courses', protect, getMyCourses);
router.post('/:id/enroll', protect, enrollInCourse);
router.get('/:id/access', protect, accessCourseContent);
router.get('/:id/payment-status', protect, getPaymentStatus);
router.get('/:id/modules', protect, getCourseModules);
router.get('/:id/progress', protect, getCourseProgress);
router.put('/:courseId/progress/:moduleId/:lessonId', protect, updateLessonProgress);

export default router;