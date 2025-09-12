import Certificate from '../models/Certificate.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Obter certificados do usuário logado
 * @route   GET /api/certificates/my-certificates
 * @access  Private
 */
export const getMyCertificates = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const certificates = await Certificate.find({ user: userId, status: 'issued' })
        .populate('course', 'title contentType')
        .sort({ createdAt: -1 });
    
    res.status(200).json(new ApiResponse(200, certificates, 'Certificados encontrados com sucesso.'));
});

/**
 * @desc    Obter certificado do usuário por curso
 * @route   GET /api/certificates/by-course/:courseId
 * @access  Private
 */
export const getCertificateByCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user._id;
    
    const certificate = await Certificate.findOne({ 
        user: userId, 
        course: courseId, 
        status: 'issued' 
    })
        .populate('user', 'name')
        .populate('course', 'title');
    
    if (!certificate) {
        throw new ApiError(404, 'Certificado não encontrado para este curso.');
    }
    
    const certificateData = {
        _id: certificate._id,
        userName: certificate.user.name,
        courseName: certificate.course.title.pt || certificate.course.title,
        completionDate: certificate.issuedAt,
        issuedAt: certificate.issuedAt
    };
    
    res.status(200).json(new ApiResponse(200, certificateData, 'Certificado encontrado com sucesso.'));
});

/**
 * @desc    Obter certificado específico por ID
 * @route   GET /api/certificates/:id
 * @access  Public
 */
export const getCertificateById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const certificate = await Certificate.findById(id)
        .populate('user', 'name')
        .populate('course', 'title');
    
    if (!certificate || certificate.status !== 'issued') {
        throw new ApiError(404, 'Certificado não encontrado.');
    }
    
    const certificateData = {
        _id: certificate._id,
        userName: certificate.user.name,
        courseName: certificate.course.title.pt || certificate.course.title,
        completionDate: certificate.issuedAt,
        issuedAt: certificate.issuedAt
    };
    
    res.status(200).json(new ApiResponse(200, certificateData, 'Certificado encontrado com sucesso.'));
});