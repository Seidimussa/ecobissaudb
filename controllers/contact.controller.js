import ContactMessage from '../models/ContactMessage.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Receber uma nova mensagem de contacto
 * @route   POST /api/contact
 * @access  Public
 */
export const receiveContactMessage = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        throw new ApiError(400, "Todos os campos do formulário são obrigatórios.");
    }

    // Guardar a mensagem no banco de dados para registo
    await ContactMessage.create({
        name,
        email,
        subject,
        message
    });

    // Futuramente, aqui podemos adicionar a lógica para enviar um email ao administrador
    // com a biblioteca Nodemailer, por exemplo.

    res.status(201).json(new ApiResponse(201, null, "Mensagem recebida com sucesso."));
});