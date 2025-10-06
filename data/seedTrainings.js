import mongoose from 'mongoose';
import Training from '../models/Training.model.js';
import User from '../models/User.model.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedTrainings = async () => {
    try {
        const mongoUri = 'mongodb+srv://ecobissau:ecobissau@ecobissaudb.f6ujbwh.mongodb.net/ecobissau?retryWrites=true&w=majority&appName=ecobissaudb';
        await mongoose.connect(mongoUri);
        console.log('Conectado ao MongoDB');

        // Buscar um usuário admin
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('Nenhum usuário admin encontrado');
            process.exit(1);
        }

        // Limpar treinamentos existentes
        await Training.deleteMany({});
        console.log('Treinamentos existentes removidos');

        const trainings = [
            {
                title: 'Workshop de Compostagem Doméstica',
                description: 'Aprenda a transformar restos orgânicos em adubo natural para suas plantas.',
                status: 'published',
                price: 0,
                duration: '4 horas',
                level: 'beginner',
                eventDate: new Date(Date.now() + 7*24*60*60*1000), // 1 semana
                location: 'Centro Comunitário de Bissau',
                maxParticipants: 30,
                createdBy: adminUser._id
            },
            {
                title: 'Horta Orgânica Urbana',
                description: 'Cultive seus próprios alimentos orgânicos em espaços pequenos.',
                status: 'published',
                price: 2500,
                duration: '6 horas',
                level: 'intermediate',
                eventDate: new Date(Date.now() + 14*24*60*60*1000), // 2 semanas
                location: 'Jardim Botânico de Bissau',
                maxParticipants: 20,
                createdBy: adminUser._id
            },
            {
                title: 'Reciclagem Criativa',
                description: 'Transforme materiais recicláveis em objetos úteis e decorativos.',
                status: 'published',
                price: 1500,
                duration: '3 horas',
                level: 'beginner',
                eventDate: new Date(Date.now() + 21*24*60*60*1000), // 3 semanas
                location: 'Escola Secundária Central',
                maxParticipants: 25,
                createdBy: adminUser._id
            },
            {
                title: 'Energia Solar Básica',
                description: 'Introdução aos sistemas de energia solar para residências.',
                status: 'published',
                price: 5000,
                duration: '8 horas',
                level: 'advanced',
                eventDate: new Date(Date.now() + 28*24*60*60*1000), // 4 semanas
                location: 'Instituto Técnico de Bissau',
                maxParticipants: 15,
                createdBy: adminUser._id
            }
        ];

        const createdTrainings = await Training.insertMany(trainings);
        console.log(`${createdTrainings.length} treinamentos criados com sucesso!`);

        process.exit(0);
    } catch (error) {
        console.error('Erro ao criar treinamentos:', error);
        process.exit(1);
    }
};

seedTrainings();