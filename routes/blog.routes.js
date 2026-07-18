import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { canPublishBlog } from '../middlewares/blogAuth.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import { cacheMiddleware } from '../middlewares/cache.middleware.js';
import { createBlogPost, getAllBlogPosts, getBlogPostById, getBlogPostBySlug, getMyBlogPosts, updateBlogPost, deleteBlogPost } from '../controllers/admin.controller.js';

const router = express.Router();

// Rotas públicas (cache removido temporariamente para depuração)
router.get('/', getAllBlogPosts);
router.get('/:slug', getBlogPostBySlug);

// Rotas para usuários com permissão
router.use(isAuthenticated);
router.get('/my-posts', canPublishBlog, getMyBlogPosts);
router.post('/', canPublishBlog, upload.single('coverImage'), createBlogPost);
router.put('/:id', canPublishBlog, upload.single('coverImage'), updateBlogPost);
router.delete('/:id', canPublishBlog, deleteBlogPost);

export default router;