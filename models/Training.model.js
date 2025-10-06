import mongoose from 'mongoose';

const trainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
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
  eventDate: {
    type: Date,
    required: true
  },
  location: {
    type: String
  },
  maxParticipants: {
    type: Number,
    default: 50
  },
  materials: [{
    name: String,
    url: String,
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

trainingSchema.index({ status: 1, eventDate: 1 });
trainingSchema.index({ createdBy: 1 });

const Training = mongoose.model('Training', trainingSchema);

export default Training;