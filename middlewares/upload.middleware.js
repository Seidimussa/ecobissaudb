import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// ======================= CÓDIGO DE DEPURAÇÃO =======================
console.log('--- A verificar variáveis de ambiente do Cloudinary ---');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET existe?', !!process.env.CLOUDINARY_API_SECRET); // Não imprimimos a chave secreta por segurança

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('ERRO FATAL: Uma ou mais variáveis de ambiente do Cloudinary não foram encontradas.');
    console.error('Verifique o seu ficheiro .env na raiz do backend.');
}
console.log('----------------------------------------------------');
// =================================================================

// A configuração lê as suas credenciais diretamente das variáveis de ambiente
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecobissau',
        allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'pdf'],
        transformation: [{
            width: 1200,
            height: 1200,
            crop: 'limit'
        }]
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 20 // Limite de 20MB
    }
});

export default upload;