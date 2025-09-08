import express from 'express';
import { receiveContactMessage } from '../controllers/contact.controller.js';

const router = express.Router();

// A rota de contacto é pública, não precisa de autenticação
router.post('/', receiveContactMessage);

export default router;