import '../config/env.js';
import mongoose from 'mongoose';

const checkDbData = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI não está definida no arquivo .env");
        }
        await mongoose.connect(mongoUri);
        console.log('Conectado ao MongoDB com sucesso.');

        const db = mongoose.connection.db;
        const postsCollection = db.collection('blogposts');
        
        const posts = await postsCollection.find({}).toArray();
        console.log(`\nEncontrado(s) ${posts.length} post(s) na base de dados.`);

        let correctionsMade = 0;

        for (let post of posts) {
            console.log(`\nVerificando post ID: ${post._id} - Título: "${post.title}"`);
            
            let updateNeeded = false;
            let updateFields = {};

            // 1. Verificar se "author" está em formato de sub-objeto JSON {"$oid": "..."}
            if (post.author && typeof post.author === 'object' && post.author.$oid) {
                console.log(`[ALERTA] Campo "author" está como sub-objeto:`, post.author);
                updateFields.author = new mongoose.Types.ObjectId(post.author.$oid);
                updateNeeded = true;
            } else if (post.author && typeof post.author === 'string') {
                console.log(`[INFO] Campo "author" está como string. Convertendo para ObjectId.`);
                updateFields.author = new mongoose.Types.ObjectId(post.author);
                updateNeeded = true;
            } else if (post.author instanceof mongoose.Types.ObjectId) {
                console.log(`[OK] Campo "author" é um ObjectId válido.`);
            } else {
                console.log(`[INFO] Campo "author" tem tipo: ${typeof post.author}`);
            }

            // 2. Verificar se "_id" foi importado como sub-objeto (geralmente MongoDB não deixa, mas bom checar)
            // 3. Verificar campos de data se foram importados como sub-objeto {"$date": "..."}
            if (post.createdAt && typeof post.createdAt === 'object' && post.createdAt.$date) {
                console.log(`[ALERTA] Campo "createdAt" está como sub-objeto:`, post.createdAt);
                updateFields.createdAt = new Date(post.createdAt.$date);
                updateNeeded = true;
            }
            if (post.updatedAt && typeof post.updatedAt === 'object' && post.updatedAt.$date) {
                console.log(`[ALERTA] Campo "updatedAt" está como sub-objeto:`, post.updatedAt);
                updateFields.updatedAt = new Date(post.updatedAt.$date);
                updateNeeded = true;
            }

            if (updateNeeded) {
                await postsCollection.updateOne({ _id: post._id }, { $set: updateFields });
                console.log(`[SUCESSO] Post corrigido!`);
                correctionsMade++;
            } else {
                console.log(`[OK] Nenhuma correção necessária para este post.`);
            }
        }

        console.log(`\n===================================`);
        console.log(`Correções efetuadas: ${correctionsMade}`);
        console.log(`===================================\n`);
        
        process.exit(0);
    } catch (error) {
        console.error('Erro ao verificar banco de dados:', error);
        process.exit(1);
    }
};

checkDbData();
