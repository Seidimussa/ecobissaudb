import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

/**
 * @desc    Listar Cursos ou Treinamentos com contagem de inscritos
 * @route   GET /api/content?type=course
 * @access  Public
 */
export const listContent = asyncHandler(async (req, res) => {
    const { type } = req.query;
    if (!['course', 'training'].includes(type)) {
        throw new ApiError(400, "O tipo de conteúdo ('course' ou 'training') é obrigatório.");
    }

    // 1. Busca TODOS os cursos/treinamentos do tipo especificado como objetos JavaScript simples.
    const contents = await Course.find({ contentType: type }).lean();

    // 2. Busca TODAS as inscrições e agrupa-as por curso.
    const enrollments = await Enrollment.aggregate([
        { $group: { _id: '$course', count: { $sum: 1 } } }
    ]);

    // 3. Cria um mapa para acesso rápido à contagem de inscrições.
    const enrollmentMap = new Map(enrollments.map(item => [item._id.toString(), item.count]));

    // 4. Transforma os dados em objetos simples e limpos, garantindo que o frontend recebe exatamente o que precisa.
    const results = contents.map(content => ({
        _id: content._id.toString(), // Garante que o ID é uma string
        title: content.title?.pt || 'Título Indisponível',
        description: content.description?.pt || 'Descrição Indisponível',
        thumbnailUrl: content.thumbnailUrl,
        level: content.level,
        duration: content.duration,
        price: content.price,
        studentCount: enrollmentMap.get(content._id.toString()) || 0
    }));

    res.status(200).json(new ApiResponse(200, results, "Conteúdo listado com sucesso."));
});

/**
 * @desc    Obter detalhes de um único Curso ou Treinamento
 * @route   GET /api/content/:id
 * @access  Public
 */
export const getContentById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, 'ID de conteúdo inválido.');
    }

    // Usa .lean() para obter um objeto JavaScript simples e rápido.
    const content = await Course.findById(req.params.id).lean();

    if (!content) {
        throw new ApiError(404, 'Conteúdo não encontrado.');
    }

    // Transforma os dados num objeto simples e limpo antes de os enviar.
    const result = {
        _id: content._id.toString(),
        title: content.title?.pt || 'Título Indisponível',
        description: content.description?.pt || 'Descrição Indisponível',
        thumbnailUrl: content.thumbnailUrl,
        contentType: content.contentType,
        level: content.level,
        duration: content.duration,
        price: content.price,
        modules: content.modules?.map(m => m.pt) || [], // Simplifica o array de módulos
    };

    res.status(200).json(new ApiResponse(200, result));
});