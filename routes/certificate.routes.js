import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getMyCertificates, getCertificateById, getCertificateByCourse } from '../controllers/certificate.controller.js';

const router = express.Router();

// Rota protegida para usuários verem seus certificados
router.get('/my-certificates', protect, getMyCertificates);

// Rota protegida para buscar certificado por curso
router.get('/by-course/:courseId', protect, getCertificateByCourse);

// Rota pública para visualizar certificado específico
router.get('/:id', getCertificateById);

export default router;