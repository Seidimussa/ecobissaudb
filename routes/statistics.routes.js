import express from 'express';
import { getPublicStatistics } from '../controllers/statistics.controller.js';

const router = express.Router();

router.get('/', getPublicStatistics);

export default router;