import Module from '../models/Module.model.js';
import Progress from '../models/Progress.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Obter módulos de um curso
 * @route   GET /api/content/:id/modules
 * @access  Private
 */
export const getCourseModules = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const modules = await Module.find({ course: id }).sort({ order: 1 });
    
    res.status(200).json(new ApiResponse(200, modules, 'Módulos encontrados com sucesso.'));
});

/**
 * @desc    Obter progresso do usuário em um curso
 * @route   GET /api/content/:id/progress
 * @access  Private
 */
export const getCourseProgress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    
    let progress = await Progress.findOne({ user: userId, course: id })
        .populate('moduleProgress.module');
    
    if (!progress) {
        // Criar progresso inicial
        const modules = await Module.find({ course: id }).sort({ order: 1 });
        const moduleProgress = modules.map(module => ({
            module: module._id,
            lessonProgress: module.lessons.map(lesson => ({
                lesson: lesson._id,
                completed: false,
                watchTime: 0,
                attempts: 0
            }))
        }));
        
        progress = await Progress.create({
            user: userId,
            course: id,
            moduleProgress,
            overallProgress: 0,
            overallScore: 0
        });
    }
    
    res.status(200).json(new ApiResponse(200, progress, 'Progresso encontrado com sucesso.'));
});

/**
 * @desc    Atualizar progresso de uma lição
 * @route   PUT /api/content/:courseId/progress/:moduleId/:lessonId
 * @access  Private
 */
export const updateLessonProgress = asyncHandler(async (req, res) => {
    const { courseId, moduleId, lessonId } = req.params;
    const { watchTime, quizScore, completed } = req.body;
    const userId = req.user._id;
    
    const progress = await Progress.findOne({ user: userId, course: courseId });
    
    if (!progress) {
        throw new ApiError(404, 'Progresso não encontrado.');
    }
    
    // Encontrar e atualizar progresso da lição
    const moduleProgress = progress.moduleProgress.find(mp => mp.module.toString() === moduleId);
    if (!moduleProgress) {
        throw new ApiError(404, 'Módulo não encontrado.');
    }
    
    const lessonProgress = moduleProgress.lessonProgress.find(lp => lp.lesson.toString() === lessonId);
    if (!lessonProgress) {
        throw new ApiError(404, 'Lição não encontrada.');
    }
    
    // Atualizar dados da lição
    if (watchTime !== undefined) lessonProgress.watchTime = watchTime;
    if (quizScore !== undefined) {
        lessonProgress.quizScore = quizScore;
        lessonProgress.attempts += 1;
    }
    if (completed) {
        lessonProgress.completed = true;
        lessonProgress.completedAt = new Date();
    }
    
    // Recalcular progresso geral
    const totalLessons = progress.moduleProgress.reduce((acc, mp) => acc + mp.lessonProgress.length, 0);
    const completedLessons = progress.moduleProgress.reduce((acc, mp) => 
        acc + mp.lessonProgress.filter(lp => lp.completed).length, 0);
    
    progress.overallProgress = Math.round((completedLessons / totalLessons) * 100);
    
    // Verificar se curso foi completado (80% ou mais)
    if (progress.overallProgress >= 80 && !progress.completed) {
        progress.completed = true;
        progress.completedAt = new Date();
    }
    
    await progress.save();
    
    res.status(200).json(new ApiResponse(200, progress, 'Progresso atualizado com sucesso.'));
});