import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['course', 'training', 'tip'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  price: {
    type: Number,
    default: 0
  },
  duration: {
    type: String
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  thumbnailUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  materials: [{
    name: String,
    url: String,
    type: String
  }],
  eventDate: {
    type: Date
  },
  location: {
    type: String
  },
  maxParticipants: {
    type: Number
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

contentSchema.index({ type: 1, status: 1 });
contentSchema.index({ createdBy: 1 });

const Content = mongoose.model('Content', contentSchema);

export default Content;