const request = require('supertest');

const app = require('../../src/server');

describe('GET /health', () => {
  it('deve retornar status UP', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'UP',
        timestamp: expect.any(String)
      })
    );
  });
});
