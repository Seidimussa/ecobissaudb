import express from 'express';
import {
    getMyCertificates,
    getCertificateDetails,
    verifyCertificate
} from '../controllers/certificate.controller.js';
import {
    isAuthenticated
} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/my-certificates', isAuthenticated, getMyCertificates);
router.post('/verify', verifyCertificate); // Rota pública
router.get('/:uniqueId', getCertificateDetails); // Rota pública

export default router;