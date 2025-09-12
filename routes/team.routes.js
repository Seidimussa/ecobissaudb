import express from 'express';
import asyncHandler from 'express-async-handler';
import Team from '../models/Team.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = express.Router();

/**
 * @desc    Buscar todos os membros da equipe
 * @route   GET /api/team
 * @access  Public
 */
router.get('/', asyncHandler(async (req, res) => {
    const teamMembers = await Team.find({}).sort({ order: 1, createdAt: -1 });
    res.status(200).json(new ApiResponse(200, teamMembers));
}));

export default router;