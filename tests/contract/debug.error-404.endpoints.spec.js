const request = require('supertest');

const app = require('../../src/server');

describe('GET /api/v1/debug/error-404', () => {
  it('deve retornar erro 404 simulado', async () => {
    const response = await request(app).get('/api/v1/debug/error-404');

    expect(response.status).toBe(404);
    expect(response.body.error).toEqual(
      expect.objectContaining({
        code: 'RESOURCE_NOT_FOUND',
        message: 'Recurso simulado não encontrado'
      })
    );
  });
});
