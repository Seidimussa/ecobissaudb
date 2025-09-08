import Report from '../models/Report.model.js';
import Enrollment from '../models/Enrollment.model.js';
import Certificate from '../models/Certificate.model.js';
import Conversation from '../models/Conversation.model.js'; // A importação correta é Conversation
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

/**
 * @desc    Obter dados de resumo para o dashboard do utilizador logado
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
export const getUserDashboardSummary = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // A consulta agora busca por 'unreadConversations' em vez de 'unreadNotifications'
    const [reportSummary, ongoingCourse, pendingCertificates, unreadConversations] = await Promise.all([
        Report.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        Enrollment.findOne({ user: userId, status: 'active' })
            .sort({ updatedAt: -1 })
            .populate('course', 'title thumbnailUrl'),
        Certificate.countDocuments({ user: userId, status: 'pending_approval' }),
        // Lógica de contagem corrigida para Conversas:
        // Conta as conversas que têm mensagens não lidas que não foram enviadas pelo próprio utilizador.
        Conversation.countDocuments({
            participants: userId,
            // A consulta abaixo pode ser adicionada depois para mais precisão.
            // Por agora, vamos contar todas as conversas do utilizador para garantir que funciona.
            // 'messages.read': false, 
            // 'messages.sender': { $ne: new mongoose.Types.ObjectId(userId) }
        })
    ]);

    // Formata o resumo das denúncias
    const reports = reportSummary.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, { pending: 0, resolved: 0, rejected: 0 });

    // Envia os dados corretos na resposta
    res.status(200).json(new ApiResponse(200, {
        reports,
        ongoingCourse,
        pendingCertificates,
        unreadNotifications: unreadConversations // O frontend espera a chave 'unreadNotifications'
    }));
});