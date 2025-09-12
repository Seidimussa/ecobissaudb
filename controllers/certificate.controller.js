import Certificate from '../models/Certificate.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Obter certificados do usuário logado
 * @route   GET /api/certificates/my
 * @access  Private
 */
export const getMyCertificates = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const certificates = await Certificate.find({ user: userId, status: 'issued' })
        .populate('course', 'title contentType')
        .sort({ createdAt: -1 });
    
    res.status(200).json(new ApiResponse(200, certificates, 'Certificados encontrados com sucesso.'));
});