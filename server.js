import './config/env.js';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { v2 as cloudinary } from 'cloudinary';
import { initializeSocket } from './utils/socketManager.js';
import { sessionMiddleware } from './middlewares/session.middleware.js';


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

// Middlewares de CORS robusto para desenvolvimento
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Permitir requisições sem origem (como mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin + '/')) {
            return callback(null, true);
        }
        console.warn(`[CORS Bloqueado] Origem: ${origin} não está na lista permitida:`, allowedOrigins);
        return callback(null, new Error('CORS bloqueou esta origem.'));
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cache headers para arquivos estáticos
app.use((req, res, next) => {
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
    }
    next();
});

// Middleware de sessão e cookies
app.use(sessionMiddleware);

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