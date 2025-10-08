import jwt from 'jsonwebtoken';

export const sessionMiddleware = (req, res, next) => {
    // Configurar cookies seguros
    res.cookie = (name, value, options = {}) => {
        const defaultOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 24 horas
            ...options
        };
        
        res.setHeader('Set-Cookie', `${name}=${value}; ${Object.entries(defaultOptions)
            .map(([key, val]) => `${key}=${val}`)
            .join('; ')}`);
    };
    
    // Ler preferências do usuário dos cookies
    const preferences = req.headers.cookie?.split(';')
        .reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            if (key?.startsWith('pref_')) {
                acc[key.replace('pref_', '')] = value;
            }
            return acc;
        }, {});
    
    req.userPreferences = preferences;
    next();
};

export const setUserPreference = (res, key, value) => {
    res.cookie(`pref_${key}`, value, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
        httpOnly: false // Permitir acesso via JS para preferências
    });
};