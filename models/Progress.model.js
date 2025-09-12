import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
  moduleProgress: [{
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    lessonProgress: [{
      lesson: { type: mongoose.Schema.Types.ObjectId },
      completed: { type: Boolean, default: false },
      watchTime: { type: Number, default: 0 }, // tempo assistido em segundos
      quizScore: { type: Number },
      attempts: { type: Number, default: 0 },
      completedAt: { type: Date }
    }],
    completed: { type: Boolean, default: false }
  }],
  overallProgress: { type: Number, default: 0 }, // percentual 0-100
  overallScore: { type: Number, default: 0 }, // média dos quizzes
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Progress', progressSchema);