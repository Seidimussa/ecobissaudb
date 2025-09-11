import express from 'express';
import { isAuthenticated, isAdmin } from '../middlewares/auth.middleware.js';

import upload from '../middlewares/upload.middleware.js';
import {
    // Dashboard
    getAdminDashboardSummary, 

    createManualEnrollment, // <-- IMPORTAR

    // Gestão de Utilizadores
    getAllUsers, getUserById, updateUserByAdmin, deleteUser,

    // Gestão de Mensagens
    sendMessageToUsers,
    getContactMessages, // <-- IMPORTAR A NOVA FUNÇÃO

    // Gestão de Denúncias
    getAllReports, getReportById, updateReportStatus,

    // Gestão de Conteúdo (Cursos, Treinamentos)
    createContent, getAllContent, getContentByIdAdmin, updateContent, deleteContent,

    // Gestão de Dicas
    createTip, getAllTips, getTipByIdAdmin, updateTip, deleteTip,

    // Gestão de Comunidades
    createCommunity, getAllCommunities, getCommunityByIdAdmin, updateCommunity, approveCommunity, getPendingCommunities,

    // Gestão de Certificados
    getPendingCertificates, issueCertificate, revokeCertificate,

    // Gestão de Configurações
    getSettings, updateSettings,

    getAllConversations,

    // Análises (movido para statistics.routes.js)
    // getReportsAnalytics, // Esta linha foi movida para outro ficheiro de rotas

} from '../controllers/admin.controller.js';

const router = express.Router();

// Middleware global para todas as rotas de admin
router.use(isAuthenticated, isAdmin);

// --- ROTAS DO DASHBOARD ---
router.get('/dashboard/summary', getAdminDashboardSummary);

// --- ROTAS DE GESTÃO DE UTILIZADORES ---
router.route('/users').get(getAllUsers);
router.route('/users/:id').get(getUserById).put(updateUserByAdmin).delete(deleteUser);

// --- ROTAS DE GESTÃO DE MENSAGENS ---
router.post('/messages/send', sendMessageToUsers);
router.get('/contact-messages', getContactMessages);
router.get('/conversations', getAllConversations); // <-- NOVA ROTA

// <-- ADICIONAR ESTA NOVA ROTA

// --- ROTAS DE GESTÃO DE DENÚNCIAS ---
router.route('/reports').get(getAllReports);
router.route('/reports/:id').get(getReportById).put(updateReportStatus);

// --- ROTAS DE GESTÃO DE CONTEÚDO ---
router.route('/content').post(upload.single('thumbnail'), createContent).get(getAllContent);
router.route('/content/:id').get(getContentByIdAdmin).put(upload.single('thumbnail'), updateContent).delete(deleteContent);

// --- ROTAS DE GESTÃO DE DICAS ---
router.route('/tips').post(upload.single('image'), createTip).get(getAllTips);
router.route('/tips/:id').get(getTipByIdAdmin).put(upload.single('image'), updateTip).delete(deleteTip);

// --- ROTAS DE GESTÃO DE COMUNIDADES ---
router.route('/communities').post(upload.single('banner'), createCommunity).get(getAllCommunities);
router.get('/communities/pending', getPendingCommunities);
router.route('/communities/:id').get(getCommunityByIdAdmin).put(upload.single('banner'), updateCommunity);
router.put('/communities/:id/approve', approveCommunity);

// --- ROTAS DE GESTÃO DE CERTIFICADOS ---
router.route('/certificates/pending').get(getPendingCertificates);
router.post('/certificates/:id/issue', issueCertificate);
router.post('/certificates/:id/revoke', revokeCertificate);

// --- ROTAS DE GESTÃO DE CONFIGURAÇÕES ---
router.route('/settings').get(getSettings).put(updateSettings);

// --- GESTÃO DE INSCRIÇÕES ---
router.post('/enrollments/manual', createManualEnrollment); // <-- NOVA ROTA

// A rota de análises foi movida para /routes/statistics.routes.js

export default router;