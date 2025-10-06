import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String,
        required: true
    },
    position: {
        type: String,
        default: 'Membro da Equipe'
    },
    order: {
        type: Number,
        default: 0
    },
    socialMedia: {
        linkedin: {
            type: String,
            default: ''
        },
        instagram: {
            type: String,
            default: ''
        },
        tiktok: {
            type: String,
            default: ''
        },
        facebook: {
            type: String,
            default: ''
        }
    }
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);
export default Team;