import * as flutterwave from './providers/flutterwave.provider.js';
import {
    ApiError
} from '../utils/ApiError.js';

// Esta função permite-nos trocar de provedor no futuro, mudando apenas uma linha
const getProvider = (providerName = 'flutterwave') => {
    if (providerName === 'flutterwave') {
        return flutterwave;
    }
    // No futuro, poderíamos adicionar: else if (providerName === 'paystack') { return paystack; }
    throw new ApiError(500, 'Provedor de pagamento não suportado ou configurado.');
};

/**
 * Cria uma intenção de pagamento através do provedor configurado.
 * @param {object} payment - O nosso documento de pagamento interno do MongoDB.
 * @param {object} user - O documento do utilizador que está a pagar.
 * @param {object} course - O documento do curso/treinamento que está a ser comprado.
 * @returns {Promise<string>} - A URL de checkout para a qual o frontend deve redirecionar o utilizador.
 */
export const createPaymentIntent = async (payment, user, course) => {
    const provider = getProvider(payment.provider);
    return provider.createPaymentLink(payment, user, course);
};

/**
 * Lida com as notificações de webhook recebidas do provedor de pagamento.
 * @param {string} providerName - O nome do provedor (ex: 'flutterwave').
 * @param {object} payload - O corpo (body) da requisição do webhook.
 * @param {string} signature - A assinatura de segurança enviada nos cabeçalhos (headers).
 * @returns {Promise<void>}
 */
export const handleWebhook = async (providerName, payload, signature) => {
    const provider = getProvider(providerName);

    // A verificação de segurança do webhook é a etapa mais crítica para prevenir fraudes.
    const isVerified = provider.verifyWebhookSignature(payload, signature);
    if (!isVerified) {
        throw new ApiError(400, 'Assinatura do webhook inválida.');
    }

    // Se a assinatura for válida, delega o processamento ao módulo do provedor.
    return provider.processWebhook(payload);
};