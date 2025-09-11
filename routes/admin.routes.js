import express from 'express';
import { isAuthenticated, isAdmin } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import {
    // Dashboard
    getAdminDashboardSummary,
    // Utilizadores
    getAllUsers, getUserById, updateUserByAdmin, deleteUser, blockUser, unblockUser,
    // Inscrições Manuais
    createManualEnrollment,
    // Mensagens
    sendMessageToUsers, getContactMessages, getAllConversations,
    // Denúncias
    getAllReports, getReportById, updateReportStatus,
    // Conteúdo
    createContent, getAllContent, getContentByIdAdmin, updateContent, deleteContent,
    // Dicas
    createTip, getAllTips, getTipByIdAdmin, updateTip, deleteTip,
    // Comunidades
    createCommunity, getAllCommunities, getCommunityByIdAdmin, updateCommunity, approveCommunity, getPendingCommunities,
    // Certificados
    getPendingCertificates, issueCertificate, revokeCertificate,
    // Configurações
    getSettings, updateSettings,
    // Parceiros
    addPartner, deletePartner,
    // Blog Posts
    createBlogPost, getAllBlogPosts, getBlogPostById, updateBlogPost, deleteBlogPost
} from '../controllers/admin.controller.js';

const router = express.Router();

// Middleware global para todas as rotas de admin
router.use(isAuthenticated, isAdmin);

// --- DASHBOARD ---
router.get('/dashboard/summary', getAdminDashboardSummary);

// --- GESTÃO DE UTILIZADORES ---
router.route('/users').get(getAllUsers);
router.route('/users/:id').get(getUserById).put(updateUserByAdmin).delete(deleteUser);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);

// --- GESTÃO DE MENSAGENS E CONVERSAS ---
router.post('/messages/send', sendMessageToUsers);
router.get('/contact-messages', getContactMessages);
router.get('/conversations', getAllConversations);

// --- GESTÃO DE INSCRIÇÕES MANUAIS ---
router.post('/enrollments/manual', createManualEnrollment);

// --- GESTÃO DE PARCEIROS ---
router.post('/partners', upload.single('logo'), addPartner);
router.delete('/partners/:id', deletePartner);

// --- GESTÃO DE BLOG POSTS ---
router.route('/blog')
    .get(getAllBlogPosts)
    .post(upload.single('coverImage'), createBlogPost);
router.route('/blog/:id')
    .get(getBlogPostById)
    .put(upload.single('coverImage'), updateBlogPost)
    .delete(deleteBlogPost);

// --- GESTÃO DE DENÚNCIAS ---
router.route('/reports').get(getAllReports);
router.route('/reports/:id').get(getReportById).put(updateReportStatus);

// --- GESTÃO DE CONTEÚDO (CURSOS/TREINAMENTOS) ---
router.route('/content').get(getAllContent).post(upload.single('thumbnail'), createContent);
router.route('/content/:id').get(getContentByIdAdmin).put(upload.single('thumbnail'), updateContent).delete(deleteContent);

// --- GESTÃO DE DICAS ---
router.route('/tips').get(getAllTips).post(upload.single('image'), createTip);
router.route('/tips/:id').get(getTipByIdAdmin).put(upload.single('image'), updateTip).delete(deleteTip);

// --- GESTÃO DE COMUNIDADES ---
router.route('/communities').get(getAllCommunities).post(upload.single('banner'), createCommunity);
router.get('/communities/pending', getPendingCommunities);
router.route('/communities/:id').get(getCommunityByIdAdmin).put(upload.single('banner'), updateCommunity);
router.put('/communities/:id/approve', approveCommunity);

// --- GESTÃO DE CERTIFICADOS ---
router.route('/certificates/pending').get(getPendingCertificates);
router.post('/certificates/:id/issue', issueCertificate);
router.post('/certificates/:id/revoke', revokeCertificate);

// --- GESTÃO DE CONFIGURAÇÕES ---
router.route('/settings').get(getSettings).put(updateSettings);

export default router;