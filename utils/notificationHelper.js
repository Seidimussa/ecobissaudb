import Notification from '../models/Notification.model.js';
import { sendNotificationToUser, sendNotificationToAll } from './socketManager.js';

export const createNotification = async (userId, type, title, message, relatedId = null) => {
  try {
    // Verificar preferências do usuário
    const NotificationPreference = (await import('../models/NotificationPreference.model.js')).default;
    let preferences = await NotificationPreference.findOne({ user: userId });
    
    if (!preferences) {
      preferences = await NotificationPreference.create({ user: userId });
    }
    
    // Verificar se o usuário quer receber este tipo de notificação
    if (!preferences.pushNotifications || !preferences.notificationTypes[type]) {
      return null;
    }
    
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedId
    });
    
    // Enviar notificação em tempo real
    sendNotificationToUser(userId, notification);
    
    return notification;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
};

// Criar notificação para todos os usuários
export const createNotificationForAll = async (type, title, message, relatedId = null) => {
  try {
    const User = (await import('../models/User.model.js')).default;
    const users = await User.find({}, '_id');
    
    const notifications = users.map(user => ({
      user: user._id,
      type,
      title,
      message,
      relatedId
    }));
    
    const createdNotifications = await Notification.insertMany(notifications);
    
    // Enviar notificação em tempo real para todos
    const notificationData = { type, title, message, relatedId };
    sendNotificationToAll(notificationData);
    
    return createdNotifications;
  } catch (error) {
    console.error('Erro ao criar notificações para todos:', error);
  }
};

// Criar notificação para usuários específicos
export const createNotificationForUsers = async (userIds, type, title, message, relatedId = null) => {
  try {
    const notifications = userIds.map(userId => ({
      user: userId,
      type,
      title,
      message,
      relatedId
    }));
    
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Erro ao criar notificações para usuários:', error);
  }
};