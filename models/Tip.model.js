import mongoose from 'mongoose';

const localizedStringSchema = new mongoose.Schema({
    pt: {
        type: String
    },
    en: {
        type: String
    },
    fr: {
        type: String
    },
    es: {
        type: String
    },
    ar: {
        type: String
    },
}, {
    _id: false
});

const tipSchema = new mongoose.Schema({
    title: localizedStringSchema,
    description: localizedStringSchema,
    category: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Fácil', 'Médio', 'Difícil'],
        required: true
    },
    impact: {
        type: String,
        enum: ['Baixo', 'Médio', 'Alto'],
        required: true
    },
    steps: [localizedStringSchema],
    imageUrl: {
        type: String
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

// Campo virtual para calcular dinamicamente o número de curtidas
tipSchema.virtual('likes').get(function () {
    return this.likedBy.length;
});

const Tip = mongoose.model('Tip', tipSchema);
export default Tip;