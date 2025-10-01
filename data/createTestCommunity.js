import mongoose from 'mongoose';
import Community from '../models/Community.model.js';
import User from '../models/User.model.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const createTestCommunity = async () => {
    try {
        const mongoUri = 'mongodb+srv://ecobissau:ecobissau@ecobissaudb.f6ujbwh.mongodb.net/ecobissau?retryWrites=true&w=majority&appName=ecobissaudb';
        await mongoose.connect(mongoUri);
        console.log('Conectado ao MongoDB');

        // Buscar um usuário para ser admin
        const user = await User.findOne();
        if (!user) {
            console.log('Nenhum usuário encontrado');
            process.exit(1);
        }

        // Criar comunidade pendente
        const pendingCommunity = await Community.create({
            name: 'Teste Comunidade Pendente',
            description: { pt: 'Esta é uma comunidade de teste aguardando aprovação do administrador.' },
            location: 'Bissau, Guiné-Bissau',
            category: 'education',
            email: 'teste@comunidade.gw',
            phone: '+245 999 888 777',
            admin: user._id,
            status: 'pending_approval'
        });

        console.log('Comunidade pendente criada:', pendingCommunity.name);
        process.exit(0);
    } catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
};

createTestCommunity();