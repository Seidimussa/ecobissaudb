import Certificate from '../models/Certificate.model.js';
import {
    ApiResponse
} from '../utils/ApiResponse.js';
import {
    ApiError
} from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

export const getMyCertificates = asyncHandler(async (req, res) => {
    const certificates = await Certificate.find({
            user: req.user._id
        })
        .populate('course', 'title')
        .sort({
            createdAt: -1
        });

    const formattedCertificates = certificates.map(cert => ({
        uniqueId: cert.uniqueId,
        courseName: cert.course.title.pt, // Assumindo português
        completionDate: cert.completionDate,
        status: cert.status,
    }));

    res.status(200).json(new ApiResponse(200, formattedCertificates));
});

export const getCertificateDetails = asyncHandler(async (req, res) => {
    const certificate = await Certificate.findOne({
            uniqueId: req.params.uniqueId,
            status: 'issued'
        })
        .populate('user', 'name')
        .populate('course', 'title');

    if (!certificate) {
        throw new ApiError(404, 'Certificado não encontrado ou inválido.');
    }

    const details = {
        userName: certificate.user.name,
        courseName: certificate.course.title.pt, // Assumindo português
        completionDate: certificate.completionDate,
        certificateId: certificate.uniqueId,
    };

    res.status(200).json(new ApiResponse(200, details));
});

export const verifyCertificate = asyncHandler(async (req, res) => {
    const {
        token
    } = req.body;
    const certificate = await Certificate.findOne({
            uniqueId: token,
            status: 'issued'
        })
        .populate('user', 'name')
        .populate('course', 'title');

    if (!certificate) {
        return res.status(200).json(new ApiResponse(200, {
            valid: false
        }));
    }

    const details = {
        userName: certificate.user.name,
        courseName: certificate.course.title.pt,
        completionDate: certificate.completionDate,
        certificateId: certificate.uniqueId,
    };

    res.status(200).json(new ApiResponse(200, {
        valid: true,
        details
    }));
});