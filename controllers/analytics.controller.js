import Report from '../models/Report.model.js';
import User from '../models/User.model.js';
import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import Certificate from '../models/Certificate.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Obter analytics gerais do sistema
 * @route   GET /api/admin/analytics
 * @access  Private (Admin)
 */
export const getSystemAnalytics = asyncHandler(async (req, res) => {
    // Contadores básicos
    const [
        totalReports,
        pendingReports,
        resolvedReports,
        totalUsers,
        totalCourses,
        totalTrainings,
        totalCertificates,
        totalEnrollments
    ] = await Promise.all([
        Report.countDocuments(),
        Report.countDocuments({ status: 'pending' }),
        Report.countDocuments({ status: 'resolved' }),
        User.countDocuments({ role: { $ne: 'admin' } }),
        Course.countDocuments({ contentType: 'course' }),
        Course.countDocuments({ contentType: 'training' }),
        Certificate.countDocuments({ status: 'issued' }),
        Enrollment.countDocuments({ status: 'active' })
    ]);

    const analytics = {
        reports: {
            total: totalReports,
            pending: pendingReports,
            resolved: resolvedReports
        },
        users: {
            total: totalUsers
        },
        content: {
            courses: totalCourses,
            trainings: totalTrainings,
            total: totalCourses + totalTrainings
        },
        certificates: {
            total: totalCertificates
        },
        enrollments: {
            total: totalEnrollments
        }
    };

    res.status(200).json(new ApiResponse(200, analytics, 'Analytics obtidos com sucesso.'));
});

/**
 * @desc    Obter analytics detalhados de cursos
 * @route   GET /api/admin/analytics/courses
 * @access  Private (Admin)
 */
export const getCoursesAnalytics = asyncHandler(async (req, res) => {
    const courses = await Course.find({ contentType: { $in: ['course', 'training'] } })
        .select('title contentType');

    const coursesWithStats = await Promise.all(
        courses.map(async (course) => {
            const [enrollments, certificates] = await Promise.all([
                Enrollment.find({ course: course._id }).populate('user', 'name email'),
                Certificate.find({ course: course._id, status: 'issued' })
            ]);

            const participants = enrollments.map(enrollment => ({
                name: enrollment.user.name,
                email: enrollment.user.email,
                status: enrollment.status,
                enrolledAt: enrollment.createdAt,
                hasCertificate: certificates.some(cert => cert.user.toString() === enrollment.user._id.toString())
            }));

            return {
                _id: course._id,
                title: course.title?.pt || course.title,
                type: course.contentType === 'course' ? 'Curso' : 'Treinamento',
                participantCount: enrollments.length,
                completedCount: enrollments.filter(e => e.status === 'completed').length,
                certificateCount: certificates.length,
                participants
            };
        })
    );

    res.status(200).json(new ApiResponse(200, coursesWithStats, 'Analytics de cursos obtidos com sucesso.'));
});