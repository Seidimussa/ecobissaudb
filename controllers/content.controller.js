import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import Payment from '../models/Payment.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

/**
 * @desc    Listar Cursos ou Treinamentos
 * @route   GET /api/content?type=course
 * @access  Public
 */
export const listContent = asyncHandler(async (req, res) => {
    const { type } = req.query;
    const filter = type ? { contentType: type } : {};

    const contents = await Course.find(filter).lean();
    const enrollments = await Enrollment.aggregate([
        { $group: { _id: '$course', count: { $sum: 1 } } }
    ]);

    const enrollmentMap = new Map(enrollments.map(item => [item._id.toString(), item.count]));

    const results = contents.map(content => ({
        _id: content._id.toString(),
        title: content.title?.pt || 'Título Indisponível',
        description: content.description?.pt || 'Descrição Indisponível',
        thumbnailUrl: content.thumbnailUrl,
        contentType: content.contentType,
        level: content.level,
        duration: content.duration,
        price: content.price,
        eventDate: content.eventDate,
        location: content.location,
        maxParticipants: content.maxParticipants,
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

    const content = await Course.findById(req.params.id).lean();
    if (!content) throw new ApiError(404, 'Conteúdo não encontrado.');

    // Verificar se usuário está inscrito (se autenticado)
    let isEnrolled = false;
    let enrollmentStatus = null;
    if (req.user) {
        const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.id });
        isEnrolled = !!enrollment;
        enrollmentStatus = enrollment?.status || null;
    }

    const result = {
        _id: content._id.toString(),
        title: content.title?.pt || 'Título Indisponível',
        description: content.description?.pt || 'Descrição Indisponível',
        thumbnailUrl: content.thumbnailUrl,
        contentType: content.contentType,
        level: content.level,
        duration: content.duration,
        price: content.price,
        modules: content.modules?.map(m => m.pt) || [],
        eventDate: content.eventDate,
        eventTime: content.eventTime,
        location: content.location,
        maxParticipants: content.maxParticipants,
        isEnrolled,
        enrollmentStatus
    };

    res.status(200).json(new ApiResponse(200, result));
});

/**
 * @desc    Inscrever usuário em curso
 * @route   POST /api/content/:id/enroll
 * @access  Private
 */
export const enrollInCourse = asyncHandler(async (req, res) => {
    const courseId = req.params.id;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, 'Curso não encontrado.');

    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) throw new ApiError(409, 'Já está inscrito neste curso.');

    const enrollment = await Enrollment.create({
        user: userId,
        course: courseId,
        status: course.price > 0 ? 'pending_payment' : 'active'
    });

    res.status(201).json(new ApiResponse(201, enrollment, 'Inscrição realizada com sucesso.'));
});

/**
 * @desc    Listar cursos do usuário
 * @route   GET /api/content/my-courses
 * @access  Private
 */
export const getMyCourses = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const enrollments = await Enrollment.find({ user: userId })
        .populate('course', 'title description thumbnailUrl price contentType level duration')
        .sort({ createdAt: -1 });

    const courses = enrollments.map(enrollment => ({
        enrollmentId: enrollment._id,
        status: enrollment.status,
        progress: enrollment.progress,
        enrolledAt: enrollment.createdAt,
        course: {
            _id: enrollment.course._id,
            title: enrollment.course.title?.pt || 'Título Indisponível',
            description: enrollment.course.description?.pt || 'Descrição Indisponível',
            thumbnailUrl: enrollment.course.thumbnailUrl,
            price: enrollment.course.price,
            level: enrollment.course.level,
            duration: enrollment.course.duration
        }
    }));

    res.status(200).json(new ApiResponse(200, courses, 'Cursos do usuário listados com sucesso.'));
});

/**
 * @desc    Verificar status de pagamento
 * @route   GET /api/content/:id/payment-status
 * @access  Private
 */
export const getPaymentStatus = asyncHandler(async (req, res) => {
    const courseId = req.params.id;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) throw new ApiError(404, 'Inscrição não encontrada.');

    const payment = await Payment.findOne({ enrollment: enrollment._id }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, {
        enrollmentStatus: enrollment.status,
        paymentStatus: payment?.status || 'no_payment',
        amount: payment?.amount || 0
    }));
});

/**
 * @desc    Acessar conteúdo do curso inscrito
 * @route   GET /api/content/:id/access
 * @access  Private
 */
export const accessCourseContent = asyncHandler(async (req, res) => {
    const courseId = req.params.id;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId })
        .populate('course');
    
    if (!enrollment) throw new ApiError(404, 'Você não está inscrito neste curso.');
    if (enrollment.status !== 'active') throw new ApiError(403, 'Acesso negado. Pagamento pendente.');

    const course = enrollment.course;
    const result = {
        _id: course._id,
        title: course.title?.pt || 'Título Indisponível',
        description: course.description?.pt || 'Descrição Indisponível',
        modules: course.modules?.map(m => m.pt) || [],
        duration: course.duration,
        level: course.level,
        progress: enrollment.progress,
        enrolledAt: enrollment.createdAt
    };

    res.status(200).json(new ApiResponse(200, result, 'Acesso ao curso liberado.'));
});

/**
 * @desc    Listar cursos disponíveis para inscrição
 * @route   GET /api/content/available
 * @access  Private
 */
export const getAvailableCourses = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const enrolledCourses = await Enrollment.find({ user: userId }).select('course');
    const enrolledIds = enrolledCourses.map(e => e.course.toString());
    
    const availableCourses = await Course.find({ 
        _id: { $nin: enrolledIds } 
    }).lean();
    
    const results = availableCourses.map(course => ({
        _id: course._id.toString(),
        title: course.title?.pt || 'Título Indisponível',
        description: course.description?.pt || 'Descrição Indisponível',
        thumbnailUrl: course.thumbnailUrl,
        contentType: course.contentType,
        level: course.level,
        duration: course.duration,
        price: course.price,
        eventDate: course.eventDate,
        location: course.location
    }));
    
    res.status(200).json(new ApiResponse(200, results, 'Cursos disponíveis listados.'));
});