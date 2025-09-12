import express from 'express';
import {
    createReport,
    listPublicReports,
    getMyReports,
    getReportById
} from '../controllers/report.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Middleware de autenticação opcional
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return protect(req, res, next);
    }
    next();
};

// Rotas públicas
router.get('/', listPublicReports);
router.get('/:id', getReportById);
router.post('/', optionalAuth, upload.array('images', 5), createReport);

// Rotas protegidas
router.get('/my/reports', protect, getMyReports);

export default router;