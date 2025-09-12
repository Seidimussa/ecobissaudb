import express from 'express';
import { getPublicStatistics, getAnalytics } from '../controllers/statistics.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getPublicStatistics);
router.get('/analytics', protect, getAnalytics);

export default router;