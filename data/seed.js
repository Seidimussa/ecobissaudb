import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User.model.js';
import Course from '../models/Course.model.js';
import Tip from '../models/Tip.model.js';
import Setting from '../models/Setting.model.js';
// Adicionar todos os modelos que vamos limpar
import Report from '../models/Report.model.js';
import Community from '../models/Community.model.js';
import Certificate from '../models/Certificate.model.js';
import Enrollment from '../models/Enrollment.model.js';
import Payment from '../models/Payment.model.js';

// Garante que o script encontra o ficheiro .env na pasta raiz do backend
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Conectado para semeadura...');
    } catch (error) {
        console.error(`Erro de Conexão: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        // --- LIMPAR DADOS ANTIGOS ---
        console.log('A limpar todas as coleções...');
        await Certificate.deleteMany();
        await Community.deleteMany();
        await Course.deleteMany();
        await Enrollment.deleteMany();
        await Payment.deleteMany();
        await Report.deleteMany();
        await Setting.deleteMany();
        await Tip.deleteMany();
        await User.deleteMany();
        console.log('Dados antigos limpos!');

        // --- CRIAR UTILIZADORES ---
        const adminUser = await User.create({
            name: 'Administrador',
            email: 'admin@ecobissau.gw',
            password: 'admin123',
            role: 'admin',
        });
        console.log('Utilizador Administrador criado.');

        // --- CRIAR CURSOS E TREINAMENTOS ---
        // --- CRIAR CONTEÚDO DE CURSOS E TREINAMENTOS ---
        const sampleCourses = [
            {
                title: { pt: "Fundamentos da Sustentabilidade" },
                description: { pt: "Aprenda os conceitos básicos..." },
                contentType: "course", // <-- É um curso
                price: 1500,
                duration: "4 semanas",
                level: "Iniciante",
                author: adminUser._id,
            },
            {
                title: { pt: "Conservação da Biodiversidade" }, // <-- NOVO CURSO
                description: { pt: "Entenda a importância da biodiversidade." },
                contentType: "course", // <-- É um curso
                price: 2500,
                duration: "6 semanas",
                level: "Intermediário",
                author: adminUser._id,
            },
            {
                title: { pt: "Workshop de Compostagem Doméstica" },
                description: { pt: "Aprenda a transformar restos orgânicos..." },
                contentType: "training", // <-- É um treinamento
                price: 500,
                eventDate: new Date('2025-09-15'),
                location: "Centro Comunitário",
                maxParticipants: 30,
                author: adminUser._id,
            }
        ];
        await Course.insertMany(sampleCourses);
        console.log('Cursos e Treinamentos criados!');

        // --- CRIAR DICAS ---
        await Tip.insertMany([
            { title: { pt: "Economize Água no Banho" }, description: { pt: "Reduza o tempo de banho." }, category: "Água", difficulty: "Fácil", impact: "Alto", author: adminUser._id },
            { title: { pt: "Desligue Aparelhos da Tomada" }, description: { pt: "Evite o consumo fantasma." }, category: "Energia", difficulty: "Fácil", impact: "Médio", author: adminUser._id },
        ]);
        console.log('Dicas criadas.');

        // --- CRIAR CONFIGURAÇÕES GERAIS ---
        await Setting.create({
            singleton: true,
            // Informações da Página de Boas-Vindas
            welcomePage: {
                hero: {
                    title: { pt: "Bem-vindo à EcoBissau" },
                    subtitle: { pt: "Junte-se a {totalUsers} cidadãos e ajude a resolver mais do que as {resolvedReports} denúncias já resolvidas." }
                },
                features: [
                    { icon: "Shield", title: { pt: "Denúncias Ambientais" }, description: { pt: "Reporte problemas ambientais na sua comunidade." } },
                    { icon: "Users", title: { pt: "Comunidade Ativa" }, description: { pt: "Conecte-se com organizações ambientais locais." } },
                    { icon: "BookOpen", title: { pt: "Educação Ambiental" }, description: { pt: "Acesse cursos e dicas para um mundo mais verde." } },
                ],
                cta: {
                    title: { pt: "Pronto para Fazer a Diferença?" },
                    subtitle: { pt: "Cada ação conta para um futuro mais sustentável." }
                }
            },
            // Informações da Página Sobre Nós
            aboutPage: {
                mission: { pt: "Proteger e preservar o meio ambiente de Bissau através da participação ativa da comunidade, educação ambiental e ações concretas." },
                vision: { pt: "Ser referência em proteção ambiental na Guiné-Bissau, criando uma comunidade consciente e engajada." },
                values: [
                    { icon: "Leaf", title: { pt: "Sustentabilidade" }, description: { pt: "Promovemos práticas que preservam o meio ambiente." } },
                    { icon: "Users", title: { pt: "Participação Comunitária" }, description: { pt: "Acreditamos na união da comunidade." } }
                ]
            },
            // Outras configurações
            tipCategories: [{ pt: "Água" }, { pt: "Energia" }, { pt: "Resíduos" }],
            reportTypes: [{ pt: "Poluição da Água" }, { pt: "Lixo Irregular" }]
        });
        console.log('Configurações criadas!');

        console.log('\n----------------------------------');
        console.log('DADOS IMPORTADOS COM SUCESSO!');
        console.log('----------------------------------');
        process.exit();
    } catch (error) {
        console.error(`\nERRO AO IMPORTAR DADOS: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    // ... (pode ser preenchido se necessário)
};

await connectDB();

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}