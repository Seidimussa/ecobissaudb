import express from 'express';
import {
    createCommunity,
    listApprovedCommunities,
    getCommunityDetails
} from '../controllers/community.controller.js';
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

export default router;