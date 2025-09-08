import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// A configuração lê as suas credenciais diretamente das variáveis de ambiente
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configura o armazenamento, especificando a pasta e os formatos permitidos
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecobissau',
        allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'pdf', 'doc', 'docx'],

        // MELHORIA OPCIONAL: Adicionar uma transformação para imagens
        // Isto irá redimensionar automaticamente qualquer imagem que seja maior
        // que 1200x1200 pixels, mantendo a proporção.
        transformation: [{
            width: 1200,
            height: 1200,
            crop: 'limit'
        }]
    },
});

// Cria a instância do Multer que será usada nas suas rotas
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 20 // Limite de 20MB por ficheiro
    }
});

export default upload;