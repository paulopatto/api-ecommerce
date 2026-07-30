const request = require('supertest');

const debugController = require('../../src/modules/debug/debugController');
const app = require('../../src/server');

describe('GET /api/v1/debug/slow', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve retornar 200 após um atraso aleatório entre 190ms e 2000ms', async () => {
    jest.spyOn(debugController, 'getRandomDelayMs').mockReturnValue(190);

    const startedAt = Date.now();
    const response = await request(app).get('/api/v1/debug/slow');
    const elapsedMs = Date.now() - startedAt;

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        message: 'Resposta atrasada com sucesso',
        delayMs: 190
      })
    );
    expect(response.body.meta.timestamp).toEqual(expect.any(String));
    expect(elapsedMs).toBeGreaterThanOrEqual(180);
  });

  it('getRandomDelayMs deve gerar valores no intervalo [190, 2000]', () => {
    const samples = Array.from({ length: 50 }, () => debugController.getRandomDelayMs());

    for (const delayMs of samples) {
      expect(delayMs).toBeGreaterThanOrEqual(debugController.MIN_DELAY_MS);
      expect(delayMs).toBeLessThanOrEqual(debugController.MAX_DELAY_MS);
    }
  });
});
