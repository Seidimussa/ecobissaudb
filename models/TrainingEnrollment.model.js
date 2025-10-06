import mongoose from 'mongoose';

const trainingEnrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  training: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Training',
    required: true
  },
  status: {
    type: String,
    enum: ['enrolled', 'completed', 'cancelled'],
    default: 'enrolled'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date
  }
}, {
  timestamps: true
});

trainingEnrollmentSchema.index({ user: 1, training: 1 }, { unique: true });
trainingEnrollmentSchema.index({ training: 1 });

const TrainingEnrollment = mongoose.model('TrainingEnrollment', trainingEnrollmentSchema);

export default TrainingEnrollment;