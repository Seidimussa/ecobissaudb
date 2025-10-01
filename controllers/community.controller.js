import Community from '../models/Community.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Criar uma nova comunidade (submissão para aprovação)
 * @route   POST /api/communities
 * @access  Private (requer login)
 */
export const createCommunity = asyncHandler(async (req, res) => {
    const { name, description, location, email, phone, website } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "O nome e a descrição são obrigatórios.");
    }

    // O ID do utilizador que submete a comunidade é retirado do token
    const adminId = req.user._id;

    const community = await Community.create({
        name,
        description: { pt: description }, // Guardar no formato de objeto para multilinguagem
        location,
        email,
        phone,
        website,
        admin: adminId,
        status: 'pending_approval' // Todas as novas comunidades começam como pendentes
    });

    res.status(201).json(new ApiResponse(201, community, "Submissão de comunidade recebida e a aguardar aprovação."));
});

/**
 * @desc    Listar todas as comunidades APROVADAS
 * @route   GET /api/communities
 * @access  Private (requer login)
 */
export const listApprovedCommunities = asyncHandler(async (req, res) => {
    const communities = await Community.find({ status: 'approved' }).populate('admin', 'name').sort({ name: 1 });
    res.status(200).json(new ApiResponse(200, communities, "Comunidades encontradas com sucesso."));
});

export const listPendingCommunities = asyncHandler(async (req, res) => {
    const communities = await Community.find({ status: 'pending_approval' }).populate('admin', 'name').sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, communities, "Comunidades pendentes encontradas."));
});

export const approveCommunity = asyncHandler(async (req, res) => {
    const community = await Community.findByIdAndUpdate(
        req.params.id,
        { status: 'approved' },
        { new: true }
    ).populate('admin', 'name');
    
    if (!community) {
        throw new ApiError(404, 'Comunidade não encontrada.');
    }
    
    res.status(200).json(new ApiResponse(200, community, "Comunidade aprovada com sucesso."));
});

export const rejectCommunity = asyncHandler(async (req, res) => {
    const community = await Community.findByIdAndUpdate(
        req.params.id,
        { status: 'rejected' },
        { new: true }
    ).populate('admin', 'name');
    
    if (!community) {
        throw new ApiError(404, 'Comunidade não encontrada.');
    }
    
    res.status(200).json(new ApiResponse(200, community, "Comunidade rejeitada."));
});

export const blockCommunity = asyncHandler(async (req, res) => {
    const community = await Community.findByIdAndUpdate(
        req.params.id,
        { status: 'blocked' },
        { new: true }
    ).populate('admin', 'name');
    
    if (!community) {
        throw new ApiError(404, 'Comunidade não encontrada.');
    }
    
    res.status(200).json(new ApiResponse(200, community, "Comunidade bloqueada."));
});

export const deleteCommunity = asyncHandler(async (req, res) => {
    const community = await Community.findByIdAndDelete(req.params.id);
    
    if (!community) {
        throw new ApiError(404, 'Comunidade não encontrada.');
    }
    
    res.status(200).json(new ApiResponse(200, null, "Comunidade eliminada permanentemente."));
});

export const unblockCommunity = asyncHandler(async (req, res) => {
    const community = await Community.findByIdAndUpdate(
        req.params.id,
        { status: 'approved' },
        { new: true }
    ).populate('admin', 'name');
    
    if (!community) {
        throw new ApiError(404, 'Comunidade não encontrada.');
    }
    
    res.status(200).json(new ApiResponse(200, community, "Comunidade desbloqueada."));
});

export const listBlockedCommunities = asyncHandler(async (req, res) => {
    const communities = await Community.find({ status: 'blocked' }).populate('admin', 'name').sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, communities, "Comunidades bloqueadas encontradas."));
});

/**
 * @desc    Obter detalhes de uma única comunidade APROVADA
 * @route   GET /api/communities/:id
 * @access  Private (requer login)
 */
export const getCommunityDetails = asyncHandler(async (req, res) => {
    const community = await Community.findOne({ _id: req.params.id, status: 'approved' })
        .populate('admin', 'name'); // Inclui o nome do utilizador administrador

    if (!community) {
        throw new ApiError(404, 'Comunidade não encontrada ou não aprovada.');
    }

    res.status(200).json(new ApiResponse(200, community));
});