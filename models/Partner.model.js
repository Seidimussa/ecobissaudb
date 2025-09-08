import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    logoUrl: {
        type: String,
        required: true
    },
    websiteUrl: { // Adicionamos um link para o site do parceiro
        type: String
    }
}, { timestamps: true });

const Partner = mongoose.model('Partner', partnerSchema);
export default Partner;