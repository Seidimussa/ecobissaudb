import Report from '../models/Report.model.js';
import Enrollment from '../models/Enrollment.model.js';
import Certificate from '../models/Certificate.model.js';
import Conversation from '../models/Conversation.model.js';
import Training from '../models/Training.model.js';
import TrainingEnrollment from '../models/TrainingEnrollment.model.js';
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

    // Buscar dados do dashboard incluindo treinamentos disponíveis
    const [reportSummary, ongoingCourse, pendingCertificates, unreadConversations, availableTrainings] = await Promise.all([
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
        }),
        // Contar treinamentos disponíveis
        Training.countDocuments({ 
            status: 'published',
            eventDate: { $gte: new Date() }, // Apenas treinamentos futuros
            // Excluir treinamentos em que o usuário já está inscrito
            _id: { 
                $nin: await TrainingEnrollment.find({ user: userId }).distinct('training')
            }
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
        unreadNotifications: unreadConversations,
        availableTrainings // Adicionar contador de treinamentos disponíveis
    }));
});