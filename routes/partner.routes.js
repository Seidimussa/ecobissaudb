import express from 'express';
import asyncHandler from 'express-async-handler';
import Partner from '../models/Partner.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = express.Router();

/**
 * @desc    Buscar todos os parceiros
 * @route   GET /api/partners
 * @access  Public
 */
router.get('/', asyncHandler(async (req, res) => {
    const partners = await Partner.find({}).sort({ createdAt: 1 });
    res.status(200).json(new ApiResponse(200, partners));
}));

export default router;