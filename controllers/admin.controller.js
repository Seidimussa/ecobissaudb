import mongoose from 'mongoose';
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
import Payment from '../models/Payment.model.js';
import BlogPost from '../models/BlogPost.model.js';
import Team from '../models/Team.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { createNotification } from '../utils/notificationHelper.js';
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
    
    // Criar notificações para os destinatários
    for (const recipient of recipients) {
        await createNotification(
            recipient._id,
            'message',
            'Nova Mensagem',
            `Você recebeu uma nova mensagem: ${subject}`,
            null
        );
    }
    
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
    const { name, email, role, phone, canPublishBlog } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'Utilizador não encontrado.');
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone = phone || user.phone;
    if (canPublishBlog !== undefined) user.canPublishBlog = canPublishBlog;
    const updatedUser = await user.save();
    const userObject = updatedUser.toObject();
    delete userObject.password;
    
    // Notificar usuário se recebeu permissão de blog
    if (canPublishBlog === true) {
        await createNotification(
            user._id,
            'message',
            'Permissão de Blog Concedida',
            'Você agora pode publicar posts no blog da plataforma!',
            null
        );
    }
    
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
export const getAllPartners = asyncHandler(async (req, res) => {
    const partners = await Partner.find({}).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, partners));
});

export const addPartner = asyncHandler(async (req, res) => {
    const { name, websiteUrl } = req.body;
    if (!name || !req.file) throw new ApiError(400, "O nome do parceiro e o logótipo são obrigatórios.");
    const newPartner = await Partner.create({ name, websiteUrl, logoUrl: req.file.path });
    res.status(201).json(new ApiResponse(201, newPartner, "Parceiro adicionado com sucesso."));
});
export const updatePartner = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, websiteUrl } = req.body;
    const updateData = { name, websiteUrl };
    if (req.file) updateData.logoUrl = req.file.path;
    
    const updatedPartner = await Partner.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPartner) throw new ApiError(404, "Parceiro não encontrado.");
    res.status(200).json(new ApiResponse(200, updatedPartner, "Parceiro atualizado com sucesso."));
});

export const deletePartner = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const partner = await Partner.findById(id);
    if (!partner) throw new ApiError(404, "Parceiro não encontrado.");
    await partner.deleteOne();
    res.status(200).json(new ApiResponse(200, null, "Parceiro removido com sucesso."));
});

// =============================================
// GESTÃO DE EQUIPE
// =============================================
export const getAllTeamMembers = asyncHandler(async (req, res) => {
    const teamMembers = await Team.find({}).sort({ order: 1, createdAt: -1 });
    res.status(200).json(new ApiResponse(200, teamMembers));
});

export const addTeamMember = asyncHandler(async (req, res) => {
    const { name, description, position, order } = req.body;
    if (!name || !description || !req.file) throw new ApiError(400, "Nome, descrição e foto são obrigatórios.");
    const newMember = await Team.create({ name, description, position, order: order || 0, photoUrl: req.file.path });
    res.status(201).json(new ApiResponse(201, newMember, "Membro da equipe adicionado com sucesso."));
});

export const updateTeamMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, position, order } = req.body;
    const updateData = { name, description, position, order };
    if (req.file) updateData.photoUrl = req.file.path;
    
    const updatedMember = await Team.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedMember) throw new ApiError(404, "Membro da equipe não encontrado.");
    res.status(200).json(new ApiResponse(200, updatedMember, "Membro da equipe atualizado com sucesso."));
});

export const deleteTeamMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const member = await Team.findById(id);
    if (!member) throw new ApiError(404, "Membro da equipe não encontrado.");
    await member.deleteOne();
    res.status(200).json(new ApiResponse(200, null, "Membro da equipe removido com sucesso."));
});

// =============================================
// GESTÃO DE BLOG POSTS
// =============================================
export const createBlogPost = asyncHandler(async (req, res) => {
    // --- INÍCIO DA DEPURAÇÃO ---
    console.log('--- A criar novo post de blog ---');
    console.log('Dados recebidos (req.body):', req.body);
    console.log('Ficheiro recebido (req.file):', req.file);
    // --- FIM DA DEPURAÇÃO ---

    const { title, content, tags, isFeatured } = req.body;

    if (!title || !content || !req.file) {
        throw new ApiError(400, "Título, conteúdo e imagem de capa são obrigatórios.");
    }

    const isFeaturedBool = isFeatured === 'true';

    try {
        if (isFeaturedBool) {
            console.log('A remover o destaque de posts antigos...');
            await BlogPost.updateMany({ isFeatured: true }, { $set: { isFeatured: false } });
        }

        console.log('A tentar criar o post no banco de dados...');
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const newPost = await BlogPost.create({
            title,
            slug,
            content,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            isFeatured: isFeaturedBool,
            coverImageUrl: req.file.path,
            author: req.user._id
        });
        console.log('Post criado com sucesso:', newPost._id);

        res.status(201).json(new ApiResponse(201, newPost, "Post do blog criado com sucesso."));

    } catch (error) {
        // --- DEPURAÇÃO DE ERRO ---
        console.error('ERRO AO CRIAR O POST NO BANCO DE DADOS:', error);
        // --- FIM DA DEPURAÇÃO DE ERRO ---
        throw new ApiError(500, 'Ocorreu um erro interno ao guardar o post.');
    }
});

export const getAllBlogPosts = asyncHandler(async (req, res) => {
    const posts = await BlogPost.find({}).populate('author', 'name _id').sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, posts));
});

export const getBlogPostById = asyncHandler(async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post não encontrado.");
    res.status(200).json(new ApiResponse(200, post));
});

export const getBlogPostBySlug = asyncHandler(async (req, res) => {
    const post = await BlogPost.findOne({ slug: req.params.slug }).populate('author', 'name profilePicture');
    if (!post) throw new ApiError(404, "Post não encontrado.");
    
    // Buscar outros posts para sidebar
    const otherPosts = await BlogPost.find({ _id: { $ne: post._id } })
        .select('title slug coverImageUrl')
        .limit(3)
        .sort({ createdAt: -1 });
    
    res.status(200).json(new ApiResponse(200, { post, otherPosts }));
});

export const updateBlogPost = asyncHandler(async (req, res) => {
    const { title, content, tags, isFeatured } = req.body;
    const isFeaturedBool = isFeatured === 'true';
    const updateData = { 
        title, 
        content, 
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [], 
        isFeatured: isFeaturedBool 
    };
    if (req.file) {
        updateData.coverImageUrl = req.file.path;
    }
    if (isFeaturedBool) {
        await BlogPost.updateMany({ _id: { $ne: req.params.id }, isFeatured: true }, { isFeatured: false });
    }
    const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedPost) throw new ApiError(404, "Post não encontrado.");
    res.status(200).json(new ApiResponse(200, updatedPost, "Post atualizado com sucesso."));
});

export const getMyBlogPosts = asyncHandler(async (req, res) => {
    const posts = await BlogPost.find({ author: req.user._id })
        .sort({ createdAt: -1 })
        .select('title slug coverImageUrl createdAt isFeatured');
    res.status(200).json(new ApiResponse(200, posts));
});

export const deleteBlogPost = asyncHandler(async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post não encontrado.");
    
    // Verificar se o usuário é o autor ou admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, "Você não tem permissão para deletar este post.");
    }
    
    await post.deleteOne();
    res.status(200).json(new ApiResponse(200, null, "Post removido com sucesso."));
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
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user');
    if (!report) throw new ApiError(404, 'Denúncia não encontrada.');
    
    // Criar notificação para o usuário
    if (status === 'resolved') {
        await createNotification(
            report.user._id,
            'report_resolved',
            'Denúncia Resolvida',
            `Sua denúncia "${report.title}" foi resolvida.`,
            report._id
        );
    } else if (status === 'rejected') {
        await createNotification(
            report.user._id,
            'report_rejected',
            'Denúncia Recusada',
            `Sua denúncia "${report.title}" foi recusada.`,
            report._id
        );
    }
    
    res.status(200).json(new ApiResponse(200, report, 'Status da denúncia atualizado.'));
});

// =============================================
// GESTÃO DE CONTEÚDO (CURSOS E TREINAMENTOS)
// =============================================
export const createContent = asyncHandler(async (req, res) => {
    const contentData = { ...req.body, author: req.user._id };
    if (req.file) contentData.thumbnailUrl = req.file.path;
    
    if (!contentData.contentType) {
        contentData.contentType = 'course';
    }
    
    const newContent = await Course.create(contentData);
    const contentTypeName = contentData.contentType === 'training' ? 'Treinamento' : 'Curso';
    
    // Notificar todos os usuários sobre novo conteúdo
    const users = await User.find({ role: 'user' }).select('_id');
    const notificationType = contentData.contentType === 'training' ? 'training_published' : 'course_published';
    
    for (const user of users) {
        await createNotification(
            user._id,
            notificationType,
            `Novo ${contentTypeName} Disponível`,
            `O ${contentTypeName.toLowerCase()} "${newContent.title}" foi publicado.`,
            newContent._id
        );
    }
    
    res.status(201).json(new ApiResponse(201, newContent, `${contentTypeName} criado com sucesso.`));
});
export const getAllContent = asyncHandler(async (req, res) => {
    const filter = req.query.contentType ? { contentType: req.query.contentType } : {};
    const content = await Course.find(filter).sort({ createdAt: -1 });
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
    const contentTypeName = updatedContent.contentType === 'training' ? 'Treinamento' : 'Curso';
    res.status(200).json(new ApiResponse(200, updatedContent, `${contentTypeName} atualizado.`));
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

export const createCertificate = asyncHandler(async (req, res) => {
    const { userId, courseId } = req.body;
    
    if (!userId || !courseId) {
        throw new ApiError(400, 'ID do usuário e ID do curso são obrigatórios.');
    }
    
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) {
        throw new ApiError(404, 'Inscrição não encontrada.');
    }
    
    const existingCertificate = await Certificate.findOne({ user: userId, course: courseId });
    if (existingCertificate) {
        throw new ApiError(409, 'Certificado já existe para este usuário e curso.');
    }
    
    const course = await Course.findById(courseId);
    
    const certificate = await Certificate.create({
        user: userId,
        course: courseId,
        status: 'issued',
        issuedAt: new Date(),
        issuedBy: req.user._id
    });
    
    await Enrollment.findByIdAndUpdate(enrollment._id, { 
        status: 'completed',
        progress: 100,
        completedAt: new Date()
    });
    
    // Criar notificação
    await createNotification(
        userId,
        'certificate_issued',
        'Certificado Emitido',
        `Seu certificado do ${course.contentType === 'training' ? 'treinamento' : 'curso'} "${course.title}" foi emitido.`,
        certificate._id
    );
    
    const populatedCertificate = await Certificate.findById(certificate._id)
        .populate('user', 'name email')
        .populate('course', 'title');
    
    res.status(201).json(new ApiResponse(201, populatedCertificate, 'Certificado criado com sucesso.'));
});

export const getAllEnrollments = asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({})
        .populate('user', 'name email')
        .populate('course', 'title contentType')
        .sort({ createdAt: -1 });
    
    res.status(200).json(new ApiResponse(200, enrollments));
});

export const getAllCertificates = asyncHandler(async (req, res) => {
    const certificates = await Certificate.find({})
        .populate('user', 'name email')
        .populate('course', 'title contentType')
        .sort({ createdAt: -1 });
    
    res.status(200).json(new ApiResponse(200, certificates));
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

// =============================================
// ANALYTICS DE DENÚNCIAS
// =============================================
export const getReportsAnalytics = asyncHandler(async (req, res) => {
    const [reportsByStatus, reportsByType, reportsByMonth, recentReports] = await Promise.all([
        // Denúncias por status
        Report.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        // Denúncias por tipo
        Report.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        // Denúncias por mês (últimos 6 meses)
        Report.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),
        // Denúncias recentes
        Report.find({}).populate('user', 'name').sort({ createdAt: -1 }).limit(10)
    ]);

    // Formatar dados
    const statusStats = reportsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, { pending: 0, resolved: 0, rejected: 0 });

    const typeStats = reportsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, {});

    const monthlyStats = reportsByMonth.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        count: item.count
    }));

    res.status(200).json(new ApiResponse(200, {
        statusStats,
        typeStats,
        monthlyStats,
        recentReports,
        totalReports: Object.values(statusStats).reduce((a, b) => a + b, 0)
    }));
});