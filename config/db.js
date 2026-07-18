import mongoose from 'mongoose';



const connectDB = async () => {
    try {
        // Verificação de segurança para o log
        if (!process.env.MONGO_URI) {
            throw new Error("A variável MONGO_URI não foi definida no arquivo .env");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Esta opção resolve o erro ECONNREFUSED em muitas redes e versões novas do Node
            family: 4
        });

        console.log(`MongoDB Conectado com Sucesso: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erro de Conexão com MongoDB: ${error.message}`);

        // Dica amigável para o log
        if (error.message.includes('ECONNREFUSED')) {
            console.warn('DICA: Verifique se o seu IP está liberado no Network Access do MongoDB Atlas.');
        }

        process.exit(1);
    }
};

export default connectDB;