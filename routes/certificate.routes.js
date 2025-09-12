import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getMyCertificates } from '../controllers/certificate.controller.js';

const router = express.Router();

// Rota protegida para usuários verem seus certificados
router.get('/my', protect, getMyCertificates);

export default router;