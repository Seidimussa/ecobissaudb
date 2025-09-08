import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // <-- 1. IMPORTAR O CORS
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import {
    errorHandler
} from './middlewares/errorHandler.js';

// Carregar variáveis de ambiente
dotenv.config();

// Conectar à Base de Dados
connectDB();

const app = express();

// Middlewares
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
// 2. CONFIGURAR O CORS ANTES DAS ROTAS
// Isto diz ao backend para aceitar pedidos do endereço do seu frontend.
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

app.use(express.json({
    limit: '10mb'
}));
app.use(express.urlencoded({
    extended: true
}));

// Rota de "saúde" do serviço
app.get('/', (req, res) => {
    res.send('EcoBissau API está rodando...');
});

// Rotas da API
app.use('/api', apiRoutes);

// Middleware de Erro (deve ser o último)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor está rodando em ${process.env.NODE_ENV} na porta ${PORT}`);
});