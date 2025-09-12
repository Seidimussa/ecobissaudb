import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'quiz', 'text'], required: true },
  videoUrl: { type: String },
  duration: { type: Number }, // em segundos
  content: { type: String },
  quiz: {
    questions: [{
      question: { type: String },
      options: [{ type: String }],
      correctAnswer: { type: Number },
      points: { type: Number, default: 1 }
    }],
    passingScore: { type: Number, default: 70 }
  },
  order: { type: Number, required: true }
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
  lessons: [lessonSchema],
  order: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Module', moduleSchema);