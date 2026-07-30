const request = require('supertest');

const app = require('../../src/server');

describe('GET /api-docs', () => {
  it('deve servir a UI do Swagger', async () => {
    const response = await request(app).get('/api-docs/');

    expect(response.status).toBe(200);
    expect(response.text).toMatch(/swagger/i);
  });
});
