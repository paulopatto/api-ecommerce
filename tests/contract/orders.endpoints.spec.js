const request = require('supertest');

jest.mock('../../src/modules/orders/orderService');

const app = require('../../src/server');
const orderService = require('../../src/modules/orders/orderService');
const AppError = require('../../src/utils/AppError');
const { createAccessToken, authHeader } = require('../helpers/auth');

describe('Orders endpoints (/api/v1/orders)', () => {
  const token = createAccessToken({ userId: 'user-1', role: 'USER' });

  it('deve exigir autenticação', async () => {
    const response = await request(app).get('/api/v1/orders');
    expect(response.status).toBe(401);
  });

  it('GET / deve listar pedidos do usuário', async () => {
    orderService.listOrders.mockResolvedValueOnce([
      { id: 'o1', status: 'PENDING', totalValue: '100.00' }
    ]);

    const response = await request(app)
      .get('/api/v1/orders')
      .set(authHeader(token));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(orderService.listOrders).toHaveBeenCalledWith('user-1');
  });

  it('POST / deve criar pedido via checkout', async () => {
    orderService.checkout.mockResolvedValueOnce({
      id: 'o1',
      status: 'PENDING',
      totalValue: '100.00'
    });

    const response = await request(app)
      .post('/api/v1/orders')
      .set(authHeader(token));

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Pedido criado com sucesso');
    expect(response.body.data.id).toBe('o1');
  });

  it('POST / deve retornar 400 quando carrinho está vazio', async () => {
    orderService.checkout.mockRejectedValueOnce(
      new AppError('Carrinho vazio', 400, 'INVALID_PAYLOAD')
    );

    const response = await request(app)
      .post('/api/v1/orders')
      .set(authHeader(token));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_PAYLOAD');
  });
});
