import express from 'express';
// Apenas importa as funções relacionadas com Cursos e Treinamentos
import { listContent, getContentById } from '../controllers/content.controller.js';

const router = express.Router();

// Rotas para Cursos e Treinamentos
router.get('/', listContent);
router.get('/:id', getContentById);

// As rotas de Dicas foram REMOVIDAS daqui

export default router;