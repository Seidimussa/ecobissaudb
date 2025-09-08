import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'O nome é obrigatório.'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'O email é obrigatório.'],
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: [true, 'O assunto é obrigatório.'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'A mensagem é obrigatória.']
    },
    status: {
        type: String,
        enum: ['new', 'read', 'archived'],
        default: 'new'
    }
}, {
    timestamps: true // Adiciona automaticamente os campos createdAt e updatedAt
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;