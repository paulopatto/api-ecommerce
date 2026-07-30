const AppError = require('../../utils/AppError');

const MIN_DELAY_MS = 190;
const MAX_DELAY_MS = 2000;

const debugController = {
    getRandomDelayMs: () =>
        Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS,

    error500: async (req, res, next) => {
        next(new AppError('Erro interno simulado', 500, 'INTERNAL_SERVER_ERROR'));
    },

    error404: async (req, res, next) => {
        next(new AppError('Recurso simulado não encontrado', 404, 'RESOURCE_NOT_FOUND'));
    },

    slow: async (req, res, next) => {
        try {
            const delayMs = debugController.getRandomDelayMs();
            await new Promise((resolve) => setTimeout(resolve, delayMs));

            res.status(200).json({
                data: {
                    message: 'Resposta atrasada com sucesso',
                    delayMs
                },
                meta: { timestamp: new Date().toISOString() }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = debugController;
module.exports.MIN_DELAY_MS = MIN_DELAY_MS;
module.exports.MAX_DELAY_MS = MAX_DELAY_MS;
