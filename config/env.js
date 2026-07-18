import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Resolver erro ECONNREFUSED ao tentar resolver SRV no MongoDB Atlas
// Configura o DNS do processo Node para usar Google DNS e Cloudflare DNS.
// Isto é 100% seguro e afeta apenas este processo do Node.js, não o computador todo.
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    console.warn("Aviso: Não foi possível configurar servidores DNS customizados:", e.message);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega as variáveis de ambiente do .env na pasta backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });
