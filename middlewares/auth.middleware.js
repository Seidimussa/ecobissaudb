import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

// Esta função já existe no seu ficheiro
export const isAuthenticated = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        throw new ApiError(401, 'Utilizador não encontrado.');
      }
      next();
    } catch (error) {
      throw new ApiError(401, 'Não autorizado, token inválido.');
    }
  }

  if (!token) {
    throw new ApiError(401, 'Não autorizado, sem token.');
  }
});

// Esta função já existe no seu ficheiro
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    throw new ApiError(403, 'Acesso negado. Rota apenas para administradores.');
  }
};

// ===================================================================
// NOVA FUNÇÃO ADICIONADA AQUI
// ===================================================================
// Este middleware é "opcional". Ele tenta verificar um utilizador, mas não falha se não houver token.
export const isAuthenticatedOptional = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Anexa o utilizador ao pedido se o token for válido
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Se o token for inválido ou expirado, simplesmente não fazemos nada e continuamos
        req.user = null;
      }
    }
    // Continua para a próxima etapa, mesmo que não haja utilizador
    next();
});