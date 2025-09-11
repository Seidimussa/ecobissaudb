import express from 'express';
import {
    listBlogPosts,
    getBlogPostBySlug
} from '../controllers/blog.controller.js';

const router = express.Router();

// Rota para buscar a lista de todos os posts
// Ex: GET /api/blog
router.get('/', listBlogPosts);

// Rota para buscar um post específico pelo seu slug (URL amigável)
// Ex: GET /api/blog/meu-primeiro-post
router.get('/:slug', getBlogPostBySlug);

export default router;