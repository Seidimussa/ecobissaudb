import Tip from '../models/Tip.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Listar todas as dicas (com filtro opcional por categoria)
 * @route   GET /api/tips
 * @access  Public
 */
export const listTips = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const filter = category && category !== 'Todos' ? { category } : {};

    const tips = await Tip.find(filter).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, tips, "Dicas encontradas com sucesso."));
});

/**
 * @desc    Obter detalhes de uma única dica
 * @route   GET /api/tips/:id
 * @access  Public
 */
export const getTipById = asyncHandler(async (req, res) => {
    const tip = await Tip.findById(req.params.id);
    if (!tip) {
        throw new ApiError(404, 'Dica não encontrada.');
    }
    res.status(200).json(new ApiResponse(200, tip));
});

/**
 * @desc    Curtir ou descurtir uma dica
 * @route   POST /api/tips/:id/like
 * @access  Private
 */
export const likeTip = asyncHandler(async (req, res) => {
    const tip = await Tip.findById(req.params.id);
    if (!tip) {
        throw new ApiError(404, 'Dica não encontrada.');
    }

    const userId = req.user._id;

    // O Mongoose lida com a conversão de string para ObjectId aqui
    const index = tip.likedBy.indexOf(userId);

    if (index === -1) {
        // Se o ID não está no array, adiciona (curtir)
        tip.likedBy.push(userId);
    } else {
        // Se o ID já está no array, remove (descurtir)
        tip.likedBy.splice(index, 1);
    }

    await tip.save();

    // Re-busca a dica para obter o campo virtual 'likes' atualizado
    const updatedTip = await Tip.findById(req.params.id);

    res.status(200).json(new ApiResponse(200, updatedTip, 'Ação de curtir/descurtir concluída.'));
});