import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import Notification from '../models/Notification.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.use(isAuthenticated);

// Buscar notificações do usuário
router.get('/', asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(new ApiResponse(200, notifications));
}));

// Marcar notificação como lida
router.put('/:id/read', asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json(new ApiResponse(200, null, 'Notificação marcada como lida'));
}));

// Marcar todas como lidas
router.put('/mark-all-read', asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { read: true });
  res.json(new ApiResponse(200, null, 'Todas as notificações marcadas como lidas'));
}));

// Contar não lidas
router.get('/unread-count', asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json(new ApiResponse(200, { count }));
}));

// Deletar notificação
router.delete('/:id', asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Notificação deletada'));
}));

// Deletar todas as notificações
router.delete('/', asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  res.json(new ApiResponse(200, null, 'Todas as notificações deletadas'));
}));

// Buscar preferências de notificação
router.get('/preferences', asyncHandler(async (req, res) => {
  const NotificationPreference = (await import('../models/NotificationPreference.model.js')).default;
  let preferences = await NotificationPreference.findOne({ user: req.user._id });
  
  if (!preferences) {
    preferences = await NotificationPreference.create({ user: req.user._id });
  }
  
  res.json(new ApiResponse(200, preferences));
}));

// Atualizar preferências de notificação
router.put('/preferences', asyncHandler(async (req, res) => {
  const NotificationPreference = (await import('../models/NotificationPreference.model.js')).default;
  const preferences = await NotificationPreference.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, upsert: true }
  );
  
  res.json(new ApiResponse(200, preferences, 'Preferências atualizadas'));
}));

export default router;