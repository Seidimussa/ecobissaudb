import mongoose from 'mongoose'; // Importação crucial
import User from '../models/User.model.js';
import Report from '../models/Report.model.js';
import Certificate from '../models/Certificate.model.js';
import Course from '../models/Course.model.js';
import Tip from '../models/Tip.model.js';
import Community from '../models/Community.model.js';
import Setting from '../models/Setting.model.js';
import Enrollment from '../models/Enrollment.model.js';
import ContactMessage from '../models/ContactMessage.model.js';
import Conversation from '../models/Conversation.model.js';
import Partner from '../models/Partner.model.js';
import Payment from '../models/Payment.model.js'; // Importação correta do modelo
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

// =============================================
// DASHBOARD
// =============================================
export const getAdminDashboardSummary = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [pendingReports, newUsersToday, totalUsers, pendingCertificates] = await Promise.all([
        Report.countDocuments({ status: 'pending' }).exec(),
        User.countDocuments({ createdAt: { $gte: today } }).exec(),
        User.countDocuments().exec(),
        Certificate.countDocuments({ status: 'pending_approval' }).exec()
    ]);
    res.status(200).json(new ApiResponse(200, {
        pendingReports, newUsersToday, totalUsers, pendingCertificates
    }));
});

// =============================================
// GESTÃO DE MENSAGENS / CONVERSAS
// =============================================
export const sendMessageToUsers = asyncHandler(async (req, res) => {
    const { recipientType, recipientId, subject, message } = req.body;
    const adminUserId = req.user._id;
    if (!recipientType || !subject || !message) throw new ApiError(400, "Destinatário, assunto e mensagem são obrigatórios.");
    let recipients = [];
    if (recipientType === 'all') {
        recipients = await User.find({ role: 'user' }).select('_id');
    } else if (recipientType === 'specific' && recipientId) {
        recipients.push({ _id: recipientId });
    } else {
        throw new ApiError(400, "Tipo de destinatário inválido ou ID em falta.");
    }
    if (recipients.length === 0) throw new ApiError(404, "Nenhum destinatário encontrado.");
    const conversationPromises = recipients.map(user => Conversation.create({
        participants: [adminUserId, user._id],
        subject: subject,
        messages: [{ sender: adminUserId, body: message }]
    }));
    await Promise.all(conversationPromises);
    res.status(201).json(new ApiResponse(201, null, `${recipients.length} conversa(s) iniciada(s) com sucesso.`));
});

export const getAllConversations = asyncHandler(async (req, res) => {
    const conversations = await Conversation.find({}).populate('participants', 'name email').sort({ updatedAt: -1 });
    res.status(200).json(new ApiResponse(200, conversations, "Todas as conversas foram encontradas."));
});

// =============================================
// GESTÃO DE MENSAGENS DE CONTACTO
// =============================================
export const getContactMessages = asyncHandler(async (req, res) => {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, messages, "Mensagens de contacto encontradas."));
});

// =============================================
// GESTÃO DE UTILIZADORES
// =============================================
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, users));
});

export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) throw new ApiError(404, 'Utilizador não encontrado.');
    res.status(200).json(new ApiResponse(200, user));
});

export const updateUserByAdmin = asyncHandler(async (req, res) => {
    const { name, email, role, phone } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'Utilizador não encontrado.');
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone = phone || user.phone;
    const updatedUser = await user.save();
    const userObject = updatedUser.toObject();
    delete userObject.password;
    res.status(200).json(new ApiResponse(200, userObject, 'Utilizador atualizado com sucesso.'));
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'Utilizador não encontrado.');
    await user.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Utilizador removido com sucesso.'));
});

export const blockUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true }).select('-password');
    if (!user) throw new ApiError(404, 'Utilizador não encontrado.');
    res.status(200).json(new ApiResponse(200, user, "Utilizador bloqueado com sucesso."));
});

export const unblockUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true }).select('-password');
    if (!user) throw new ApiError(404, 'Utilizador não encontrado.');
    res.status(200).json(new ApiResponse(200, user, "Utilizador desbloqueado com sucesso."));
});

// =============================================
// GESTÃO DE INSCRIÇÕES MANUAIS
// =============================================
export const createManualEnrollment = asyncHandler(async (req, res) => {
    const { userId, courseId, reason } = req.body;
    if (!userId || !courseId) throw new ApiError(400, "O ID do utilizador e o ID do curso são obrigatórios.");
    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) throw new ApiError(409, "Este utilizador já está inscrito neste curso.");
    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, "Curso não encontrado.");
    const enrollment = await Enrollment.create({ user: userId, course: courseId, status: 'active' });

    await Payment.create({
        user: userId,
        enrollment: enrollment._id,
        amount: 0,
        currency: 'XOF',
        status: 'completed',
        provider: `manual_${reason || 'cash'}`,
        providerTransactionId: `manual-${enrollment._id}-${Date.now()}`
    });
    res.status(201).json(new ApiResponse(201, enrollment, "Inscrição manual criada com sucesso."));
});

// =============================================
// GESTÃO DE PARCEIROS
// =============================================
export const addPartner = asyncHandler(async (req, res) => {
    const { name, websiteUrl } = req.body;
    if (!name || !req.file) throw new ApiError(400, "O nome do parceiro e o logótipo são obrigatórios.");
    const newPartner = await Partner.create({ name, websiteUrl, logoUrl: req.file.path });
    res.status(201).json(new ApiResponse(201, newPartner, "Parceiro adicionado com sucesso."));
});

export const deletePartner = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const partner = await Partner.findById(id);
    if (!partner) throw new ApiError(404, "Parceiro não encontrado.");
    await partner.deleteOne();
    res.status(200).json(new ApiResponse(200, null, "Parceiro removido com sucesso."));
});


// =============================================
// GESTÃO DE DENÚNCIAS
// =============================================
export const getAllReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, reports));
});
export const getReportById = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id).populate('user', 'name email');
    if (!report) throw new ApiError(404, 'Denúncia não encontrada.');
    res.status(200).json(new ApiResponse(200, report));
});
export const updateReportStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['pending', 'resolved', 'rejected'].includes(status)) throw new ApiError(400, 'Status inválido.');
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) throw new ApiError(404, 'Denúncia não encontrada.');
    res.status(200).json(new ApiResponse(200, report, 'Status da denúncia atualizado.'));
});

// =============================================
// GESTÃO DE CONTEÚDO (CURSOS E TREINAMENTOS)
// =============================================
export const createContent = asyncHandler(async (req, res) => {
    const contentData = { ...req.body, author: req.user._id };
    if (req.file) contentData.thumbnailUrl = req.file.path;
    const newContent = await Course.create(contentData);
    res.status(201).json(new ApiResponse(201, newContent, 'Conteúdo criado com sucesso.'));
});
export const getAllContent = asyncHandler(async (req, res) => {
    const content = await Course.find({}).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, content));
});
export const getContentByIdAdmin = asyncHandler(async (req, res) => {
    const content = await Course.findById(req.params.id);
    if (!content) throw new ApiError(404, 'Conteúdo não encontrado.');
    res.status(200).json(new ApiResponse(200, content));
});
export const updateContent = asyncHandler(async (req, res) => {
    const contentData = { ...req.body };
    if (req.file) contentData.thumbnailUrl = req.file.path;
    const updatedContent = await Course.findByIdAndUpdate(req.params.id, contentData, { new: true });
    if (!updatedContent) throw new ApiError(404, 'Conteúdo não encontrado.');
    res.status(200).json(new ApiResponse(200, updatedContent, 'Conteúdo atualizado.'));
});
export const deleteContent = asyncHandler(async (req, res) => {
    const content = await Course.findById(req.params.id);
    if (!content) throw new ApiError(404, 'Conteúdo não encontrado.');
    await content.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Conteúdo removido.'));
});

// =============================================
// GESTÃO DE DICAS
// =============================================
export const createTip = asyncHandler(async (req, res) => {
    const tipData = { ...req.body, author: req.user._id };
    if (req.file) tipData.imageUrl = req.file.path;
    const newTip = await Tip.create(tipData);
    res.status(201).json(new ApiResponse(201, newTip, 'Dica criada com sucesso.'));
});
export const getAllTips = asyncHandler(async (req, res) => {
    const tips = await Tip.find({}).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, tips));
});
export const getTipByIdAdmin = asyncHandler(async (req, res) => {
    const tip = await Tip.findById(req.params.id);
    if (!tip) throw new ApiError(404, 'Dica não encontrada.');
    res.status(200).json(new ApiResponse(200, tip));
});
export const updateTip = asyncHandler(async (req, res) => {
    const tipData = { ...req.body };
    if (req.file) tipData.imageUrl = req.file.path;
    const updatedTip = await Tip.findByIdAndUpdate(req.params.id, tipData, { new: true });
    if (!updatedTip) throw new ApiError(404, 'Dica não encontrada.');
    res.status(200).json(new ApiResponse(200, updatedTip, 'Dica atualizada.'));
});
export const deleteTip = asyncHandler(async (req, res) => {
    const tip = await Tip.findById(req.params.id);
    if (!tip) throw new ApiError(404, 'Dica não encontrada.');
    await tip.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Dica removida.'));
});

// =============================================
// GESTÃO DE COMUNIDADES
// =============================================
export const createCommunity = asyncHandler(async (req, res) => {
    const communityData = { ...req.body };
    if (req.file) communityData.bannerImageUrl = req.file.path;
    const newCommunity = await Community.create(communityData);
    res.status(201).json(new ApiResponse(201, newCommunity, 'Comunidade criada com sucesso.'));
});
export const getAllCommunities = asyncHandler(async (req, res) => {
    const communities = await Community.find({}).populate('admin', 'name').sort({ name: 1 });
    res.status(200).json(new ApiResponse(200, communities));
});
export const getCommunityByIdAdmin = asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.id);
    if (!community) throw new ApiError(404, 'Comunidade não encontrada.');
    res.status(200).json(new ApiResponse(200, community));
});
export const updateCommunity = asyncHandler(async (req, res) => {
    const communityData = { ...req.body };
    if (req.file) communityData.bannerImageUrl = req.file.path;
    const updatedCommunity = await Community.findByIdAndUpdate(req.params.id, communityData, { new: true });
    if (!updatedCommunity) throw new ApiError(404, 'Comunidade não encontrada.');
    res.status(200).json(new ApiResponse(200, updatedCommunity, 'Comunidade atualizada.'));
});
export const approveCommunity = asyncHandler(async (req, res) => {
    const community = await Community.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!community) throw new ApiError(404, 'Comunidade não encontrada.');
    res.status(200).json(new ApiResponse(200, community, 'Comunidade aprovada.'));
});
export const getPendingCommunities = asyncHandler(async (req, res) => {
    const pending = await Community.find({ status: 'pending_approval' }).populate('admin', 'name email').sort({ createdAt: 1 });
    res.status(200).json(new ApiResponse(200, pending));
});

// =============================================
// GESTÃO DE CERTIFICADOS
// =============================================
export const getPendingCertificates = asyncHandler(async (req, res) => {
    const certificates = await Certificate.find({ status: 'pending_approval' }).populate('user', 'name email').populate('course', 'title').sort({ createdAt: 1 });
    res.status(200).json(new ApiResponse(200, certificates));
});
export const issueCertificate = asyncHandler(async (req, res) => {
    const certificate = await Certificate.findByIdAndUpdate(req.params.id, { status: 'issued' }, { new: true });
    if (!certificate) throw new ApiError(404, 'Certificado não encontrado.');
    res.status(200).json(new ApiResponse(200, certificate, 'Certificado emitido com sucesso.'));
});
export const revokeCertificate = asyncHandler(async (req, res) => {
    const certificate = await Certificate.findByIdAndUpdate(req.params.id, { status: 'revoked' }, { new: true });
    if (!certificate) throw new ApiError(404, 'Certificado não encontrado.');
    res.status(200).json(new ApiResponse(200, certificate, 'Certificado revogado.'));
});

// =============================================
// GESTÃO DE CONFIGURAÇÕES
// =============================================
const getOrCreateSettings = async () => {
    let settings = await Setting.findOne({ singleton: true });
    if (!settings) {
        settings = await Setting.create({ singleton: true });
    }
    return settings;
};
export const getSettings = asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    res.status(200).json(new ApiResponse(200, settings));
});
export const updateSettings = asyncHandler(async (req, res) => {
    const settings = await Setting.findOneAndUpdate({ singleton: true }, req.body, { new: true, upsert: true });
    res.status(200).json(new ApiResponse(200, settings, 'Configurações atualizadas.'));
});