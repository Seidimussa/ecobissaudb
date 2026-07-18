import {
    ApiError
} from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    // Se o erro não for uma instância de ApiError, crie uma
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Erro interno do servidor";
        error = new ApiError(statusCode, message, error.errors || [], error.stack);
    }

    // Log do erro no console do servidor para depuração
    console.error(`[Erro da API] ${req.method} ${req.originalUrl} -> Status ${error.statusCode}:`, error.message);
    if (error.stack && process.env.NODE_ENV === "development") {
        console.error(error.stack);
    }

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? {
            stack: error.stack
        } : {}),
    };

    // Envia a resposta de erro
    return res.status(error.statusCode).json(response);
};

export {
    errorHandler
};