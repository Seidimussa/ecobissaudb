import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { v2 as cloudinary } from 'cloudinary';
import { initializeSocket } from './utils/socketManager.js';
// --- CONFIGURAÇÃO ROBUSTA DO DOTENV ---
// 1. Obtém o caminho do diretório atual (onde server.js está)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Aponta explicitamente para o ficheiro .env na mesma pasta
// Isto remove qualquer ambiguidade e força o carregamento das variáveis.
dotenv.config({ path: path.resolve(__dirname, '.env') });
// --- FIM DA CONFIGURAÇÃO ROBUSTA ---


// Debug das variáveis do Cloudinary
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET existe?', !!process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// Conectar à Base de Dados
connectDB();

const app = express();
const server = createServer(app);

// Inicializar Socket.IO
initializeSocket(server);

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rota de "saúde" do serviço
app.get('/', (req, res) => {
    res.send('EcoBissau API está rodando...');
});

// Rotas da API
app.use('/api', apiRoutes);

// Middleware de Erro (deve ser o último)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Servidor está rodando em ${process.env.NODE_ENV} na porta ${PORT}`);
});