import User from '../models/User.model.js';
import generateToken from '../utils/generateToken.js';
import {
    ApiResponse
} from '../utils/ApiResponse.js';
import {
    ApiError
} from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler'; // Um utilitário para evitar try-catch repetitivos

// @desc    Registrar um novo utilizador
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        phone
    } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, 'Por favor, preencha todos os campos obrigatórios.');
    }

    const userExists = await User.findOne({
        email
    });
    if (userExists) {
        throw new ApiError(409, 'AUTH_EMAIL_IN_USE');
    }

    const user = await User.create({
        name,
        email,
        password,
        phone
    });

    if (user) {
        res.status(201).json(new ApiResponse(201, null, 'Utilizador registado com sucesso.'));
    } else {
        throw new ApiError(400, 'Dados de utilizador inválidos.');
    }
});

// @desc    Autenticar utilizador e obter token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
    const {
        email,
        password
    } = req.body;
    const user = await User.findOne({
        email
    });

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id, user.role);
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            role: user.role,
        };

        res.status(200).json(new ApiResponse(200, {
            token,
            user: userData
        }, 'Login bem-sucedido.'));
    } else {
        throw new ApiError(401, 'INVALID_CREDENTIALS');
    }
});

// @desc    Logout do utilizador
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
    // Para JWT sem estado, o logout é gerido no cliente. O backend apenas confirma.
    // Lógica de blocklist de tokens poderia ser adicionada aqui.
    res.status(200).json(new ApiResponse(200, null, 'Logout bem-sucedido.'));
});