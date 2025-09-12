import mongoose from 'mongoose';
import { autoIssueCertificate } from '../utils/certificateHelper.js';

const enrollmentSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ['pending_payment', 'active', 'completed'],
        default: 'pending_payment'
    },
    progress: {
        type: Number,
        default: 0
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Garante que um utilizador só se possa inscrever uma vez no mesmo curso
enrollmentSchema.index({
    user: 1,
    course: 1
}, {
    unique: true
});

// Middleware para emitir certificado automaticamente quando enrollment é marcado como completed
enrollmentSchema.post('save', async function(doc) {
  if (doc.status === 'completed' && doc.progress === 100) {
    await autoIssueCertificate(doc.user, doc.course);
  }
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;