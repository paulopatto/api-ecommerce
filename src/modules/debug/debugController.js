const AppError = require('../../utils/AppError');

const debugController = {
    error500: async (req, res, next) => {
        next(new AppError('Erro interno simulado', 500, 'INTERNAL_SERVER_ERROR'));
    },

    error404: async (req, res, next) => {
        next(new AppError('Recurso simulado não encontrado', 404, 'RESOURCE_NOT_FOUND'));
    }
};

module.exports = debugController;
