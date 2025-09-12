import User from '../models/User.model.js';
import Report from '../models/Report.model.js';
import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import Tip from '../models/Tip.model.js';
import Community from '../models/Community.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

export const getPublicStatistics = asyncHandler(async (req, res) => {
    const [totalUsers, resolvedReports, totalCourses, totalTrainings, totalTips, totalCommunities] = await Promise.all([
        User.countDocuments(),
        Report.countDocuments({ status: 'resolved' }),
        Course.countDocuments({ contentType: 'course' }),
        Course.countDocuments({ contentType: 'training' }),
        Tip.countDocuments(),
        Community.countDocuments({ status: 'approved' })
    ]);

    const stats = { totalUsers, resolvedReports, totalCourses, totalTrainings, totalTips, totalCommunities };
    res.status(200).json(new ApiResponse(200, stats));
});

export const getAnalytics = asyncHandler(async (req, res) => {
    const [reportStats, courseStats, enrollmentStats] = await Promise.all([
        // Estatísticas de denúncias por status
        Report.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        // Estatísticas de cursos por tipo
        Course.aggregate([
            { $group: { _id: '$contentType', count: { $sum: 1 } } }
        ]),
        // Estatísticas de inscrições por status
        Enrollment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
    ]);

    // Formatar dados para o frontend
    const reports = reportStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, { pending: 0, resolved: 0, rejected: 0 });

    const courses = courseStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, { course: 0, training: 0 });

    const enrollments = enrollmentStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, { pending_payment: 0, active: 0, completed: 0 });

    res.status(200).json(new ApiResponse(200, {
        reports,
        courses,
        enrollments,
        totalReports: Object.values(reports).reduce((a, b) => a + b, 0),
        totalCourses: Object.values(courses).reduce((a, b) => a + b, 0),
        totalEnrollments: Object.values(enrollments).reduce((a, b) => a + b, 0)
    }));
});