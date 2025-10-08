import NodeCache from 'node-cache';

// Cache em memória com TTL de 5 minutos por padrão
const cache = new NodeCache({ stdTTL: 300 });

export const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        const key = req.originalUrl;
        const cached = cache.get(key);
        
        if (cached) {
            return res.json(cached);
        }
        
        res.sendResponse = res.json;
        res.json = (body) => {
            cache.set(key, body, duration);
            res.sendResponse(body);
        };
        
        next();
    };
};

export const clearCache = (pattern) => {
    const keys = cache.keys();
    keys.forEach(key => {
        if (key.includes(pattern)) {
            cache.del(key);
        }
    });
};

export default cache;