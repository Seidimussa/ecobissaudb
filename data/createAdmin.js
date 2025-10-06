import mongoose from 'mongoose';
import User from '../models/User.model.js';
import bcryptjs from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const createAdmin = async () => {
    try {
        const mongoUri = 'mongodb+srv://ecobissau:ecobissau@ecobissaudb.f6ujbwh.mongodb.net/ecobissau?retryWrites=true&w=majority&appName=ecobissaudb';
        await mongoose.connect(mongoUri);
        console.log('Conectado ao MongoDB');

        // Verificar se admin já existe
        const existingAdmin = await User.findOne({ email: 'admin@ecobissau.gw' });
        if (existingAdmin) {
            console.log('Admin já existe. Atualizando senha...');
            
            // Atualizar senha
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash('admin123', salt);
            
            await User.findByIdAndUpdate(existingAdmin._id, {
                password: hashedPassword,
                role: 'admin'
            });
            
            console.log('Senha do admin atualizada!');
        } else {
            // Criar novo admin
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash('admin123', salt);
            
            const admin = await User.create({
                name: 'Administrador EcoBissau',
                email: 'admin@ecobissau.gw',
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            
            console.log('Admin criado com sucesso!');
            console.log('Email:', admin.email);
        }
        
        console.log('\n=== CREDENCIAIS DE LOGIN ===');
        console.log('Email: admin@ecobissau.gw');
        console.log('Senha: admin123');
        console.log('============================\n');
        
        process.exit(0);
    } catch (error) {
        console.error('Erro ao criar admin:', error);
        process.exit(1);
    }
};

createAdmin();