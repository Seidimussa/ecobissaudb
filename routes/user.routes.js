import express from 'express';
import {
    getUserProfile,
    getMyProfile,
    updateUserProfile,
    updateUserPassword,
    updateUserAvatar,
    getEnrollmentStatus // Certifique-se de que está a ser importado
} from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// As rotas do perfil usam o 'req.user' do token, por isso não precisam de '/me'
router.route('/profile')
    .get(isAuthenticated, getUserProfile)
    .put(isAuthenticated, updateUserProfile);

router.get('/me', isAuthenticated, getMyProfile);

router.put('/password', isAuthenticated, updateUserPassword);
router.post('/avatar', isAuthenticated, upload.single('avatar'), updateUserAvatar);

// Rota para verificar o status de inscrição. É relativo ao utilizador logado.
// O URL será: /api/users/enrollment-status/:courseId
router.get('/enrollment-status/:courseId', isAuthenticated, getEnrollmentStatus);

export default router;