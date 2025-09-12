import mongoose from 'mongoose';
import {
    v4 as uuidv4
} from 'uuid'; // Precisaremos instalar o pacote uuid

const certificateSchema = new mongoose.Schema({
    uniqueId: {
        type: String,
        default: () => uuidv4(),
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    completionDate: {
        type: Date,
        default: Date.now
    },
    issuedAt: {
        type: Date
    },
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending_approval', 'issued', 'revoked'],
        default: 'pending_approval'
    }
}, {
    timestamps: true
});

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;