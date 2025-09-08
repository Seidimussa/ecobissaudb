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