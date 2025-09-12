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
import partnerRoutes from './partner.routes.js';
import blogRoutes from './blog.routes.js';
import courseRoutes from './course.routes.js';
import trainingRoutes from './training.routes.js';

const router = express.Router();

// --- Rotas Públicas e de Autenticação ---
router.use('/auth', authRoutes);
router.use('/settings', settingRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/contact', contactRoutes);
router.use('/tips', tipRoutes);
router.use('/partners', partnerRoutes);
router.use('/blog', blogRoutes);
router.use('/courses', courseRoutes);
router.use('/trainings', trainingRoutes);

// --- Rota de Conteúdo (Cursos e Treinamentos) ---
router.use('/content', contentRoutes);

// --- Rotas Protegidas ---
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);
router.use('/communities', communityRoutes);
router.use('/certificates', certificateRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/conversations', conversationRoutes);
router.use('/admin', adminRoutes);

export default router;