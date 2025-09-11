import mongoose from 'mongoose';
import slugify from 'slugify';

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'O título é obrigatório.'],
        trim: true
    },
    slug: { // Para URLs amigáveis, ex: /blog/meu-primeiro-post
        type: String,
        required: true,
        unique: true
    },
    content: { // O corpo do post
        type: String,
        required: [true, 'O conteúdo é obrigatório.']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverImageUrl: {
        type: String,
        required: [true, 'Uma imagem de capa é obrigatória.']
    },
    tags: [String], // Categorias ou tags, ex: ["Sustentabilidade", "Bissau"]
    isFeatured: { // Para a secção de "Destaque"
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Middleware para gerar o slug automaticamente antes de guardar
blogPostSchema.pre('validate', function (next) {
    if (this.title && this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;