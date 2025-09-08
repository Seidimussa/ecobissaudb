import express from 'express';
// A importação de 'getPublicStatistics' foi REMOVIDA
import { getPublicSettings } from '../controllers/setting.controller.js';

const router = express.Router();

// Esta rota lida apenas com as configurações públicas do site
router.get('/public', getPublicSettings);

// A rota '/statistics' foi REMOVIDA daqui

export default router;