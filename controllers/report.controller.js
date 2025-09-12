import Report from '../models/Report.model.js';
import {
    ApiResponse
} from '../utils/ApiResponse.js';
import {
    ApiError
} from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

export const createReport = asyncHandler(async (req, res) => {
    const {
        title,
        type,
        description,
        location
    } = req.body;

    if (!title || !type || !description || !location) {
        throw new ApiError(400, 'Todos os campos são obrigatórios.');
    }

    // Processar a localização de string para GeoJSON
    let coordinates;
    try {
        // Tenta interpretar como "Lat: xxx, Lng: yyy" ou JSON
        if (location.includes('Lat:')) {
            const parts = location.split(',');
            const lat = parseFloat(parts[0].split(':')[1].trim());
            const lng = parseFloat(parts[1].split(':')[1].trim());
            coordinates = [lng, lat];
        } else {
            coordinates = JSON.parse(location);
        }
    } catch (e) {
        throw new ApiError(400, 'Formato de localização inválido. Use GPS ou forneça coordenadas [longitude, latitude].');
    }

    const reportData = {
        title,
        type,
        description,
        location: {
            type: 'Point',
            coordinates
        },
        user: req.user ? req.user._id : null
    };

    if (req.files && req.files.length > 0) {
        reportData.images = req.files.map(file => file.path);
    }

    const report = await Report.create(reportData);
    res.status(201).json(new ApiResponse(201, report, 'Denúncia criada com sucesso.'));
});

export const listPublicReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({ status: { $ne: 'rejected' } })
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .limit(20);
    res.status(200).json(new ApiResponse(200, reports));
});

/**
 * @desc    Listar denúncias do usuário
 * @route   GET /api/reports/my-reports
 * @access  Private
 */
export const getMyReports = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const reports = await Report.find({ user: userId })
        .sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, reports, 'Suas denúncias listadas com sucesso.'));
});

/**
 * @desc    Obter detalhes de uma denúncia
 * @route   GET /api/reports/:id
 * @access  Public
 */
export const getReportById = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id).populate('user', 'name');
    if (!report) throw new ApiError(404, 'Denúncia não encontrada.');
    res.status(200).json(new ApiResponse(200, report));
});