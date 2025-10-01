import express from 'express';
import {
    createCommunity,
    listApprovedCommunities,
    listPendingCommunities,
    listBlockedCommunities,
    getCommunityDetails,
    approveCommunity,
    rejectCommunity,
    blockCommunity,
    unblockCommunity,
    deleteCommunity
} from '../controllers/community.controller.js';
import { isAdmin } from '../middlewares/auth.middleware.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js'; // Vamos preparar para o upload de banner

const router = express.Router();

// Todas as rotas de comunidade requerem que o utilizador esteja logado
router.use(isAuthenticated);

router.route('/')
    .get(listApprovedCommunities)
    .post(upload.single('banner'), createCommunity); // A criação pode incluir um banner

router.route('/:id')
    .get(getCommunityDetails);

// Rotas administrativas
router.get('/admin/pending', isAdmin, listPendingCommunities);
router.get('/admin/blocked', isAdmin, listBlockedCommunities);
router.put('/admin/:id/approve', isAdmin, approveCommunity);
router.put('/admin/:id/reject', isAdmin, rejectCommunity);
router.put('/admin/:id/block', isAdmin, blockCommunity);
router.put('/admin/:id/unblock', isAdmin, unblockCommunity);
router.delete('/admin/:id', isAdmin, deleteCommunity);

export default router;