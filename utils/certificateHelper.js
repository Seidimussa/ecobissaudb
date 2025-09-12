import Certificate from '../models/Certificate.model.js';
import Enrollment from '../models/Enrollment.model.js';

export const autoIssueCertificate = async (userId, courseId) => {
    try {
        // Verificar se já existe certificado
        const existingCertificate = await Certificate.findOne({ user: userId, course: courseId });
        if (existingCertificate) return;

        // Criar certificado automaticamente
        await Certificate.create({
            user: userId,
            course: courseId,
            status: 'issued',
            issuedAt: new Date()
        });

        // Atualizar enrollment para completed
        await Enrollment.findOneAndUpdate(
            { user: userId, course: courseId },
            { 
                status: 'completed',
                progress: 100,
                completedAt: new Date()
            }
        );

        console.log(`Certificado emitido automaticamente para usuário ${userId} no curso ${courseId}`);
    } catch (error) {
        console.error('Erro ao emitir certificado automaticamente:', error);
    }
};