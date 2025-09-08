import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Conetado com Sucesso: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erro de Conexão com MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;