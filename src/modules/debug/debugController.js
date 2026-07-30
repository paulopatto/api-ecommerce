const AppError = require('../../utils/AppError');

const debugController = {
    error500: async (req, res, next) => {
        next(new AppError('Erro interno simulado', 500, 'INTERNAL_SERVER_ERROR'));
    }
};

module.exports = debugController;
