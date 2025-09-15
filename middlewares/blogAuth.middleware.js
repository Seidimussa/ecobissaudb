import { ApiError } from '../utils/ApiError.js';

export const canPublishBlog = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.canPublishBlog) {
        return next();
    }
    throw new ApiError(403, 'Você não tem permissão para publicar no blog.');
};