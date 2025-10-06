import mongoose from 'mongoose';
import Team from '../models/Team.model.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedTeam = async () => {
    try {
        const mongoUri = 'mongodb+srv://ecobissau:ecobissau@ecobissaudb.f6ujbwh.mongodb.net/ecobissau?retryWrites=true&w=majority&appName=ecobissaudb';
        await mongoose.connect(mongoUri);
        console.log('Conectado ao MongoDB');

        // Limpar equipe existente
        await Team.deleteMany({});
        console.log('Equipe existente removida');

        const teamMembers = [
            {
                name: 'Ana Silva',
                description: 'Especialista em sustentabilidade urbana com 10 anos de experiência.',
                position: 'Diretora Executiva',
                photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
                order: 1,
                socialMedia: {
                    linkedin: 'https://linkedin.com/in/ana-silva',
                    instagram: 'https://instagram.com/ana.eco',
                    facebook: 'https://facebook.com/ana.silva.eco',
                    tiktok: ''
                }
            },
            {
                name: 'Carlos Mendes',
                description: 'Engenheiro ambiental focado em soluções de energia renovável.',
                position: 'Coordenador Técnico',
                photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                order: 2,
                socialMedia: {
                    linkedin: 'https://linkedin.com/in/carlos-mendes',
                    instagram: '',
                    facebook: 'https://facebook.com/carlos.mendes',
                    tiktok: 'https://tiktok.com/@carlos.eco'
                }
            },
            {
                name: 'Maria Santos',
                description: 'Educadora ambiental e especialista em comunicação comunitária.',
                position: 'Coordenadora de Educação',
                photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
                order: 3,
                socialMedia: {
                    linkedin: '',
                    instagram: 'https://instagram.com/maria.eco.edu',
                    facebook: 'https://facebook.com/maria.santos.edu',
                    tiktok: 'https://tiktok.com/@maria.eco'
                }
            }
        ];

        const createdMembers = await Team.insertMany(teamMembers);
        console.log(`${createdMembers.length} membros da equipe criados com sucesso!`);

        process.exit(0);
    } catch (error) {
        console.error('Erro ao criar equipe:', error);
        process.exit(1);
    }
};

seedTeam();