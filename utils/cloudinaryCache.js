import { v2 as cloudinary } from 'cloudinary';

export const getOptimizedImageUrl = (publicId, options = {}) => {
    const defaultOptions = {
        quality: 'auto',
        fetch_format: 'auto',
        crop: 'fill',
        ...options
    };
    
    return cloudinary.url(publicId, {
        ...defaultOptions,
        cache: '31536000' // Cache por 1 ano
    });
};

export const getOptimizedVideoUrl = (publicId, options = {}) => {
    const defaultOptions = {
        quality: 'auto',
        fetch_format: 'auto',
        ...options
    };
    
    return cloudinary.video_url(publicId, {
        ...defaultOptions,
        cache: '31536000'
    });
};

export const generateResponsiveImageUrls = (publicId) => {
    const sizes = [320, 640, 768, 1024, 1280];
    
    return sizes.map(width => ({
        width,
        url: getOptimizedImageUrl(publicId, { width, crop: 'scale' })
    }));
};