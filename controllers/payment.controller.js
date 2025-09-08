import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import Payment from '../models/Payment.model.js';
import {
    createPaymentIntent,
    handleWebhook
} from '../services/payment.service.js';
import {
    ApiError
} from '../utils/ApiError.js';
import {
    ApiResponse
} from '../utils/ApiResponse.js';
import asyncHandler from 'express-async-handler';

export const initiatePayment = asyncHandler(async (req, res, next) => {
    const {
        contentId
    } = req.params;
    const userId = req.user._id;

    const content = await Course.findById(contentId);
    if (!content) throw new ApiError(404, 'Conteúdo (Curso/Treinamento) não encontrado.');

    const existingEnrollment = await Enrollment.findOne({
        user: userId,
        course: contentId,
        status: 'active'
    });
    if (existingEnrollment) throw new ApiError(409, 'Você já está inscrito neste conteúdo.');

    if (content.contentType === 'training' && content.maxParticipants) {
        const participantCount = await Enrollment.countDocuments({
            course: contentId,
            status: 'active'
        });
        if (participantCount >= content.maxParticipants) {
            throw new ApiError(409, 'Este treinamento está esgotado.');
        }
    }

    const enrollment = await Enrollment.create({
        user: userId,
        course: contentId
    });

    const payment = await Payment.create({
        user: userId,
        enrollment: enrollment._id,
        amount: content.price,
        currency: 'XOF', // Moeda padrão para a região
        provider: 'flutterwave' // Provedor padrão
    });

    const paymentLink = await createPaymentIntent(payment, req.user, content);

    res.status(200).json(new ApiResponse(200, {
        paymentLink
    }, 'Sessão de pagamento criada.'));
});

export const handleFlutterwaveWebhook = asyncHandler(async (req, res, next) => {
    const signature = req.headers['verify-hash'];
    await handleWebhook('flutterwave', req.body, signature);
    res.status(200).send('Webhook processado');
});