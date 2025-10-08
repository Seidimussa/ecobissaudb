import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { getUserPreferences, updateUserPreferences } from '../controllers/preferences.controller.js';

const router = express.Router();

router.use(isAuthenticated);
router.get('/', getUserPreferences);
router.put('/', updateUserPreferences);

export default router;