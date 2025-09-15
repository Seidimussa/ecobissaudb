import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  notificationTypes: {
    certificate_issued: {
      type: Boolean,
      default: true
    },
    course_published: {
      type: Boolean,
      default: true
    },
    training_published: {
      type: Boolean,
      default: true
    },
    report_resolved: {
      type: Boolean,
      default: true
    },
    report_rejected: {
      type: Boolean,
      default: true
    },
    report_submitted: {
      type: Boolean,
      default: true
    },
    message: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });

const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);
export default NotificationPreference;