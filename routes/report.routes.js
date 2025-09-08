import express from 'express';
import {
    createReport,
    listPublicReports
} from '../controllers/report.controller.js';
import upload from '../middlewares/upload.middleware.js';
import {
    isAuthenticatedOptional
} from '../middlewares/auth.middleware.js'; // Precisaremos criar este middleware

const router = express.Router();

// Middleware de autenticação opcional
const isAuthenticatedOptionalHandler = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return isAuthenticated(req, res, next);
    }
    next();
};

router.route('/')
    .get(listPublicReports)
    .post(isAuthenticatedOptionalHandler, upload.array('images', 5), createReport);

export default router;