import express from 'express';
import {
    initiatePayment,
    handleFlutterwaveWebhook
} from '../controllers/payment.controller.js';
import {
    isAuthenticated
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// O utilizador inicia o pagamento para se inscrever num curso ou treinamento
// O :contentId pode ser um ID de Curso ou Treinamento, pois usamos um modelo unificado
router.post('/checkout/:contentId', isAuthenticated, initiatePayment);

// O provedor de pagamento (Flutterwave) envia notificações para este endpoint
// Esta rota NÃO deve ter o middleware `isAuthenticated` porque é o servidor do provedor que a chama
router.post('/webhooks/flutterwave', handleFlutterwaveWebhook);

// A linha que faltava e que resolve o erro:
export default router;