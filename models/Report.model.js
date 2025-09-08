import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        } // Formato [longitude, latitude]
    },
    images: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['pending', 'resolved', 'rejected'],
        default: 'pending'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }, // Permite denúncias anónimas
}, {
    timestamps: true
});

// Cria um índice geoespacial para otimizar consultas de localização
reportSchema.index({
    location: '2dsphere'
});

const Report = mongoose.model('Report', reportSchema);
export default Report;