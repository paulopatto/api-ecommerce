const request = require('supertest');

const app = require('../../src/server');

describe('OpenAPI download endpoints', () => {
  it('GET /openapi.json deve retornar a spec OpenAPI', async () => {
    const response = await request(app).get('/openapi.json');

    expect(response.status).toBe(200);
    expect(response.headers['content-disposition']).toMatch(/openapi\.json/);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.paths['/health']).toBeDefined();
  });

  it('GET /openapi.yaml deve retornar o YAML', async () => {
    const response = await request(app).get('/openapi.yaml');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/yaml/);
    expect(response.text).toMatch(/openapi:\s*3\.0\.3/);
  });
});
