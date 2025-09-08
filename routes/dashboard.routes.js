import express from 'express';
import { getUserDashboardSummary } from '../controllers/dashboard.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas as rotas de dashboard são protegidas
router.use(isAuthenticated);

router.get('/summary', getUserDashboardSummary);

export default router;