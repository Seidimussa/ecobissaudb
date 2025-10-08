import asyncHandler from 'express-async-handler';
import { ApiResponse } from '../utils/ApiResponse.js';
import { setUserPreference } from '../middlewares/session.middleware.js';

// @desc    Obter preferências do usuário
// @route   GET /api/preferences
// @access  Private
export const getUserPreferences = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.userPreferences, 'Preferências obtidas com sucesso.'));
});

// @desc    Atualizar preferências do usuário
// @route   PUT /api/preferences
// @access  Private
export const updateUserPreferences = asyncHandler(async (req, res) => {
    const { theme, language, notifications } = req.body;
    
    if (theme) setUserPreference(res, 'theme', theme);
    if (language) setUserPreference(res, 'language', language);
    if (notifications !== undefined) setUserPreference(res, 'notifications', notifications);
    
    res.status(200).json(new ApiResponse(200, null, 'Preferências atualizadas com sucesso.'));
});