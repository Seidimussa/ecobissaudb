import mongoose from 'mongoose';

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

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;