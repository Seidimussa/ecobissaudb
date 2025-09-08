import Conversation from '../models/Conversation.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

// Utilizador busca as suas conversas
export const getMyConversations = asyncHandler(async (req, res) => {
    const conversations = await Conversation.find({ participants: req.user._id })
        .populate('participants', 'name role profilePicture') // Popula com mais detalhes
        .sort({ updatedAt: -1 });
    res.status(200).json(new ApiResponse(200, conversations));
});

// Utilizador (ou Admin) envia uma nova mensagem numa conversa existente
export const replyToConversation = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { body } = req.body;

    if (!body || body.trim() === '') {
        throw new ApiError(400, "A mensagem não pode estar vazia.");
    }

    // Garante que o utilizador que está a responder faz parte da conversa
    const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id });

    if (!conversation) {
        throw new ApiError(404, "Conversa não encontrada ou não tem permissão para responder.");
    }

    conversation.messages.push({ sender: req.user._id, body: body.trim() });

    // Atualiza o timestamp 'updatedAt' para que a conversa apareça no topo da lista
    conversation.updatedAt = Date.now();

    const updatedConversation = await conversation.save();

    // Popula os participantes na resposta para que a UI possa ser atualizada
    await updatedConversation.populate('participants', 'name role profilePicture');

    res.status(201).json(new ApiResponse(201, updatedConversation, "Resposta enviada."));
});