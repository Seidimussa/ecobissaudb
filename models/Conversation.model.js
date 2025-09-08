import mongoose from 'mongoose';

// Schema para uma única mensagem dentro de uma conversa
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    body: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adiciona createdAt e updatedAt a cada mensagem
});

// Schema para a conversa principal
const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    subject: {
        type: String,
        required: true,
        default: 'Nova Conversa'
    },
    messages: [messageSchema]
}, {
    timestamps: true // Adiciona createdAt e updatedAt à conversa (para ordenação)
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;