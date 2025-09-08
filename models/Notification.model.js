import mongoose from 'mongoose';
const localizedStringSchema = new mongoose.Schema({ pt: String, en: String, fr: String, es: String, ar: String }, { _id: false });
const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: localizedStringSchema,
    message: localizedStringSchema,
    read: { type: Boolean, default: false },
    type: { type: String, enum: ['system', 'admin_message', 'achievement'], default: 'admin_message' }
}, { timestamps: true });
const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;