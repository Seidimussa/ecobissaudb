import User from '../models/User.model.js';
import Report from '../models/Report.model.js';
import Enrollment from '../models/Enrollment.model.js'; // <-- IMPORTAÇÃO NECESSÁRIA
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5);
    if (user) {
        res.status(200).json(new ApiResponse(200, { user, reports }));
    } else {
        throw new ApiError(404, 'Utilizador não encontrado.');
    }
});

export const getMyProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.status(200).json(new ApiResponse(200, user));
    } else {
        throw new ApiError(404, 'Utilizador não encontrado.');
    }
});

export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) throw new ApiError(409, 'O email já está em uso.');
            user.email = req.body.email;
        }
        const updatedUser = await user.save();
        const userObject = updatedUser.toObject();
        delete userObject.password;
        res.json(new ApiResponse(200, userObject));
    } else {
        throw new ApiError(404, 'Utilizador não encontrado.');
    }
});

export const updateUserPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (user && (await user.matchPassword(currentPassword))) {
        user.password = newPassword;
        await user.save();
        res.json(new ApiResponse(200, null, 'Senha atualizada com sucesso.'));
    } else {
        throw new ApiError(401, 'Senha atual incorreta.');
    }
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'Nenhum ficheiro foi carregado.');
    const user = await User.findByIdAndUpdate(req.user._id, { profilePicture: req.file.path }, { new: true }).select('-password');
    res.status(200).json(new ApiResponse(200, user, 'Avatar atualizado com sucesso.'));
});

// =======================================================
// NOVA FUNÇÃO ADICIONADA AQUI
// =======================================================
/**
 * @desc    Verificar o status de inscrição de um utilizador num curso específico
 * @route   GET /api/users/me/enrollment-status/:courseId
 * @access  Private
 */
export const getEnrollmentStatus = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });

    if (enrollment) {
        // Se a inscrição existe, retorna o seu status
        res.status(200).json(new ApiResponse(200, { status: enrollment.status }));
    } else {
        // Se não existe, retorna um status 'not_enrolled'
        res.status(200).json(new ApiResponse(200, { status: 'not_enrolled' }));
    }
});