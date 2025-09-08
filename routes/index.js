import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import reportRoutes from './report.routes.js';
import contentRoutes from './content.routes.js';
import communityRoutes from './community.routes.js';
import certificateRoutes from './certificate.routes.js';
import paymentRoutes from './payment.routes.js';
import settingRoutes from './setting.routes.js';
import adminRoutes from './admin.routes.js';
import statisticsRoutes from './statistics.routes.js';
import tipRoutes from './tip.routes.js';
import contactRoutes from './contact.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import conversationRoutes from './conversation.routes.js';

const router = express.Router();

// --- Rotas Públicas e de Autenticação ---
router.use('/auth', authRoutes);
router.use('/settings', settingRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/contact', contactRoutes);
router.use('/tips', tipRoutes); // Dicas antes de conteúdo

// --- Rota de Conteúdo (Cursos e Treinamentos) ---
// Esta rota tem um parâmetro /:id, por isso deve vir depois de rotas mais específicas
router.use('/content', contentRoutes);

// --- Rotas Protegidas (requerem login ou são de admin) ---
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);
router.use('/communities', communityRoutes);
router.use('/certificates', certificateRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/conversations', conversationRoutes);
router.use('/admin', adminRoutes);

export default router;