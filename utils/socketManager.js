import { Server } from 'socket.io';

let io;
const userSockets = new Map(); // userId -> socketId

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Usuário se autentica
    socket.on('authenticate', (userId) => {
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      console.log(`Usuário ${userId} autenticado com socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
        console.log(`Usuário ${socket.userId} desconectado`);
      }
    });
  });

  return io;
};

// Enviar notificação em tempo real para usuário específico
export const sendNotificationToUser = (userId, notification) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId && io) {
    io.to(socketId).emit('newNotification', notification);
  }
};

// Enviar notificação para todos os usuários conectados
export const sendNotificationToAll = (notification) => {
  if (io) {
    io.emit('newNotification', notification);
  }
};

export { io };