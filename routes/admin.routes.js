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
    getPendingCertificates, issueCertificate, revokeCertificate, createCertificate, getAllEnrollments, getAllCertificates,
    // Configurações
    getSettings, updateSettings,
    // Parceiros
    addPartner, getAllPartners, updatePartner, deletePartner,
    // Equipe
    addTeamMember, getAllTeamMembers, updateTeamMember, deleteTeamMember,
    // Blog Posts
    createBlogPost, getAllBlogPosts, getBlogPostById, updateBlogPost, deleteBlogPost,
    // Analytics
    getReportsAnalytics
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
router.route('/partners')
    .get(getAllPartners)
    .post(upload.single('logo'), addPartner);
router.put('/partners/:id', upload.single('logo'), updatePartner);
router.delete('/partners/:id', deletePartner);

// --- GESTÃO DE EQUIPE ---
router.route('/team')
    .get(getAllTeamMembers)
    .post(upload.single('photo'), addTeamMember);
router.put('/team/:id', upload.single('photo'), updateTeamMember);
router.delete('/team/:id', deleteTeamMember);

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

// --- GESTÃO DE CURSOS ---
router.route('/courses').get((req, res, next) => { req.query.contentType = 'course'; getAllContent(req, res, next); }).post(upload.single('thumbnail'), (req, res, next) => { req.body.contentType = 'course'; createContent(req, res, next); });
router.route('/courses/:id').get(getContentByIdAdmin).put(upload.single('thumbnail'), updateContent).delete(deleteContent);

// --- GESTÃO DE TREINAMENTOS ---
router.route('/trainings').get((req, res, next) => { req.query.contentType = 'training'; getAllContent(req, res, next); }).post(upload.single('thumbnail'), (req, res, next) => { req.body.contentType = 'training'; createContent(req, res, next); });
router.route('/trainings/:id').get(getContentByIdAdmin).put(upload.single('thumbnail'), updateContent).delete(deleteContent);

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
router.post('/certificates/create', createCertificate);
router.get('/enrollments', getAllEnrollments);
router.get('/certificates/all', getAllCertificates);

// --- GESTÃO DE CONFIGURAÇÕES ---
router.route('/settings').get(getSettings).put(updateSettings);

// --- ANALYTICS ---
router.get('/reports-analytics', getReportsAnalytics);

export default router;