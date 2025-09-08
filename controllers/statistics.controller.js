import User from '../models/User.model.js';
import Report from '../models/Report.model.js';
import Course from '../models/Course.model.js';
import Tip from '../models/Tip.model.js';
import Community from '../models/Community.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from 'express-async-handler';

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