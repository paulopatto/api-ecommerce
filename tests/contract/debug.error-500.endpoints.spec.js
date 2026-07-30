const request = require('supertest');

const app = require('../../src/server');

describe('GET /api/v1/debug/error-500', () => {
  it('deve retornar erro 500 simulado', async () => {
    const response = await request(app).get('/api/v1/debug/error-500');

    expect(response.status).toBe(500);
    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro interno simulado'
      })
    );
  });
});
