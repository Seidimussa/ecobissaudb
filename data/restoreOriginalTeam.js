import mongoose from 'mongoose';
import Team from '../models/Team.model.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const restoreOriginalTeam = async () => {
    try {
        const mongoUri = 'mongodb+srv://ecobissau:ecobissau@ecobissaudb.f6ujbwh.mongodb.net/ecobissau?retryWrites=true&w=majority&appName=ecobissaudb';
        await mongoose.connect(mongoUri);
        console.log('Conectado ao MongoDB');

        // Limpar equipe atual
        await Team.deleteMany({});
        console.log('Equipe atual removida');

        // Restaurar membros originais sem redes sociais
        const originalTeamMembers = [
            {
                name: 'João Silva',
                description: 'Especialista em sustentabilidade com mais de 10 anos de experiência.',
                position: 'Diretor Executivo',
                photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                order: 1
            },
            {
                name: 'Maria Santos',
                description: 'Coordenadora de projetos ambientais e educação comunitária.',
                position: 'Coordenadora de Projetos',
                photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
                order: 2
            },
            {
                name: 'Carlos Mendes',
                description: 'Engenheiro ambiental focado em soluções sustentáveis.',
                position: 'Engenheiro Ambiental',
                photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                order: 3
            }
        ];

        const restoredMembers = await Team.insertMany(originalTeamMembers);
        console.log(`${restoredMembers.length} membros originais restaurados!`);

        process.exit(0);
    } catch (error) {
        console.error('Erro ao restaurar equipe original:', error);
        process.exit(1);
    }
};

restoreOriginalTeam();