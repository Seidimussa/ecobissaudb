import mongoose from 'mongoose';

const localizedStringSchema = new mongoose.Schema({
    pt: {
        type: String
    },
    en: {
        type: String
    },
    fr: {
        type: String
    },
    es: {
        type: String
    },
    ar: {
        type: String
    },
}, {
    _id: false
});

const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: localizedStringSchema,
    bannerImageUrl: {
        type: String
    },
    location: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    website: {
        type: String
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending_approval', 'approved', 'rejected'],
        default: 'pending_approval'
    }
}, {
    timestamps: true
});

const Community = mongoose.model('Community', communitySchema);
export default Community;