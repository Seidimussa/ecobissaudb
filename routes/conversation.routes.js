import express from 'express';
import { getMyConversations, replyToConversation } from '../controllers/conversation.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(isAuthenticated);

router.get('/', getMyConversations);
router.post('/:conversationId/reply', replyToConversation);

export default router;