import express from 'express';
import { listTips, getTipById, likeTip } from '../controllers/tip.controller.js';
import { isAuthenticated, isAuthenticatedOptional } from '../middlewares/auth.middleware.js';

const router = express.Router();

// As rotas de listagem são públicas
router.get('/', listTips);
router.get('/:id', getTipById);

// A rota de curtir é privada (requer login)
router.post('/:id/like', isAuthenticated, likeTip);

export default router;