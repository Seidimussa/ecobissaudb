import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import Training from '../models/Training.model.js';
import TrainingEnrollment from '../models/TrainingEnrollment.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Listar treinamentos disponíveis
router.get('/available', isAuthenticated, asyncHandler(async (req, res) => {
    const trainings = await Training.find({ 
        status: 'published',
        eventDate: { $gte: new Date() }
    }).sort({ eventDate: 1 });
    
    res.status(200).json(new ApiResponse(200, trainings, "Treinamentos encontrados."));
}));

// Inscrever em treinamento
router.post('/:id/enroll', isAuthenticated, asyncHandler(async (req, res) => {
    const training = await Training.findById(req.params.id);
    if (!training) {
        return res.status(404).json(new ApiResponse(404, null, "Treinamento não encontrado."));
    }
    
    const existingEnrollment = await TrainingEnrollment.findOne({
        user: req.user._id,
        training: req.params.id
    });
    
    if (existingEnrollment) {
        return res.status(400).json(new ApiResponse(400, null, "Já inscrito neste treinamento."));
    }
    
    const enrollment = await TrainingEnrollment.create({
        user: req.user._id,
        training: req.params.id
    });
    
    res.status(201).json(new ApiResponse(201, enrollment, "Inscrição realizada com sucesso."));
}));

export default router;