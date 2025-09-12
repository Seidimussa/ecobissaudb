import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';
import { getSystemAnalytics, getCoursesAnalytics } from '../controllers/analytics.controller.js';

const router = express.Router();

// Todas as rotas são protegidas e apenas para admin
router.use(protect, isAdmin);

router.get('/', getSystemAnalytics);
router.get('/courses', getCoursesAnalytics);

export default router;