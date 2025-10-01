import mongoose from 'mongoose';
import Community from '../models/Community.model.js';
import User from '../models/User.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedCommunities = async () => {
    try {
        const mongoUri = 'mongodb+srv://ecobissau:ecobissau@ecobissaudb.f6ujbwh.mongodb.net/ecobissau?retryWrites=true&w=majority&appName=ecobissaudb';
        await mongoose.connect(mongoUri);
        console.log('Conectado ao MongoDB');

        // Limpar comunidades existentes
        await Community.deleteMany({});
        console.log('Comunidades existentes removidas');

        // Buscar um usuário admin para ser dono das comunidades
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('Nenhum usuário admin encontrado. Criando comunidades sem admin.');
        }

        const communities = [
            {
                name: 'EcoVerde Bissau',
                description: { pt: 'Organização dedicada à preservação das áreas verdes de Bissau e promoção da sustentabilidade urbana.' },
                location: 'Bissau, Guiné-Bissau',
                category: 'conservation',
                email: 'contato@ecoverde.gw',
                phone: '+245 955 123 456',
                website: 'https://ecoverde.gw',
                admin: adminUser?._id,
                status: 'approved',
                bannerImageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
                profileImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&h=200&fit=crop'
            },
            {
                name: 'Recicla Bissau',
                description: { pt: 'Iniciativa comunitária focada na reciclagem e gestão sustentável de resíduos na capital.' },
                location: 'Bissau, Guiné-Bissau',
                category: 'recycling',
                email: 'info@reciclabissau.org',
                phone: '+245 966 789 012',
                admin: adminUser?._id,
                status: 'approved',
                bannerImageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=400&fit=crop',
                profileImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
            },
            {
                name: 'Educação Ambiental GB',
                description: { pt: 'Promovemos a educação ambiental nas escolas e comunidades da Guiné-Bissau através de workshops e campanhas.' },
                location: 'Bissau, Guiné-Bissau',
                category: 'education',
                email: 'educacao@ambientalgb.org',
                phone: '+245 977 345 678',
                website: 'https://educacaoambiental.gw',
                admin: adminUser?._id,
                status: 'approved',
                bannerImageUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=400&fit=crop',
                profileImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop'
            },
            {
                name: 'Mangal Proteção',
                description: { pt: 'Organização especializada na proteção e restauração dos manguezais da costa da Guiné-Bissau.' },
                location: 'Bolama, Guiné-Bissau',
                category: 'conservation',
                email: 'mangal@protecao.gw',
                phone: '+245 988 456 789',
                admin: adminUser?._id,
                status: 'approved',
                bannerImageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop',
                profileImageUrl: 'https://images.unsplash.com/photo-1574263867128-a3d5c1b1deac?w=200&h=200&fit=crop'
            },
            {
                name: 'Jovens Eco Ativistas',
                description: { pt: 'Movimento jovem que organiza ações de limpeza, plantio de árvores e conscientização ambiental.' },
                location: 'Bissau, Guiné-Bissau',
                category: 'education',
                email: 'jovens@ecoativistas.gw',
                admin: adminUser?._id,
                status: 'approved',
                bannerImageUrl: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=400&fit=crop',
                profileImageUrl: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=200&h=200&fit=crop'
            }
        ];

        const createdCommunities = await Community.insertMany(communities);
        console.log(`${createdCommunities.length} comunidades criadas com sucesso!`);

        process.exit(0);
    } catch (error) {
        console.error('Erro ao criar comunidades:', error);
        process.exit(1);
    }
};

seedCommunities();