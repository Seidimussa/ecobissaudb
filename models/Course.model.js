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

const courseSchema = new mongoose.Schema({
    title: localizedStringSchema,
    description: localizedStringSchema,
    contentType: {
        type: String,
        enum: ['course', 'training'],
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    thumbnailUrl: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Campos específicos para 'course' (online)
    duration: {
        type: String
    },
    level: {
        type: String,
        enum: ['Iniciante', 'Intermediário', 'Avançado']
    },
    modules: [localizedStringSchema],

    // Campos específicos para 'training' (presencial)
    eventDate: {
        type: Date
    },
    eventTime: {
        type: String
    },
    location: {
        type: String
    },
    maxParticipants: {
        type: Number
    },
}, {
    timestamps: true
});

const Course = mongoose.model('Course', courseSchema);
export default Course;