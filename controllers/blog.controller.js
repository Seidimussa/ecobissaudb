import BlogPost from '../models/BlogPost.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';
import { clearCache } from '../middlewares/cache.middleware.js';

/**
 * @desc    Listar todos os posts do blog (público)
 * @route   GET /api/blog
 * @access  Public
 */
export const listBlogPosts = asyncHandler(async (req, res) => {
    const posts = await BlogPost.find({})
        .populate('author', 'name')
        .sort({ createdAt: -1 });
    
    // Cache por 10 minutos
    res.setHeader('Cache-Control', 'public, max-age=600');
    res.status(200).json(new ApiResponse(200, posts));
});

/**
 * @desc    Obter um único post do blog pelo seu slug (URL amigável)
 * @route   GET /api/blog/:slug
 * @access  Public
 */
export const getBlogPostBySlug = asyncHandler(async (req, res) => {
    const post = await BlogPost.findOne({ slug: req.params.slug })
        .populate('author', 'name profilePicture');

    if (!post) {
        throw new ApiError(404, "Publicação não encontrada.");
    }

    // Opcional: Buscar outros posts (exceto o atual) para uma secção "Leia a seguir"
    const otherPosts = await BlogPost.find({ slug: { $ne: req.params.slug } })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title slug coverImageUrl');

    res.status(200).json(new ApiResponse(200, { post, otherPosts }));
});