import Setting from '../models/Setting.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from 'express-async-handler';

const getOrCreateSettings = async () => {
    let settings = await Setting.findOne({ singleton: true });
    if (!settings) {
        settings = await Setting.create({ singleton: true });
    }
    return settings;
};

export const getPublicSettings = asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    res.status(200).json(new ApiResponse(200, settings));
});