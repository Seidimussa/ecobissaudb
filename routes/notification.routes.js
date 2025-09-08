import express from 'express';
import { getMyNotifications } from '../controllers/notification.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
const router = express.Router();
router.get('/my-notifications', isAuthenticated, getMyNotifications);
export default router;