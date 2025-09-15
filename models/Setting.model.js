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

const settingSchema = new mongoose.Schema({
    // Chave única para garantir que haja apenas um documento de configurações
    singleton: {
        type: Boolean,
        default: true,
        unique: true
    },

    // Informações de contacto e rodapé
    contactInfo: {
        address: [String],
        phone: [String],
        email: [String],
        hours: [String],
        emergencyPhone: String,
        emergencyEmail: String
    },
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        youtube: String,
        tiktok: String,
        whatsapp: String,
        telegram: String,
        linkedin: String
    },

    // Configurações de Notificação
    notifications: {
        adminEmail: String,
        emailOnNewReport: {
            type: Boolean,
            default: true
        },
        emailOnNewUser: {
            type: Boolean,
            default: false
        }
    },

    // Conteúdo Gerenciável de Páginas
    welcomePage: {
        hero: {
            title: localizedStringSchema,
            subtitle: localizedStringSchema
        },
        features: [{
            icon: String,
            title: localizedStringSchema,
            description: localizedStringSchema
        }],
        cta: {
            title: localizedStringSchema,
            subtitle: localizedStringSchema
        }
    },
    aboutPage: {
        mission: localizedStringSchema,
        vision: localizedStringSchema,
        values: [{
            icon: String,
            title: localizedStringSchema,
            description: localizedStringSchema
        }]
    },

    // Metadados da aplicação
    reportTypes: [localizedStringSchema],
    tipCategories: [localizedStringSchema],
    challengeOfTheDay: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tip'
    }
}, {
    timestamps: true
});

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;