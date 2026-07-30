const request = require('supertest');

jest.mock('../../src/modules/cart/cartService');

const app = require('../../src/server');
const cartService = require('../../src/modules/cart/cartService');
const AppError = require('../../src/utils/AppError');
const { createAccessToken, authHeader } = require('../helpers/auth');

describe('Cart endpoints (/api/v1/cart)', () => {
  const token = createAccessToken({ userId: 'user-1', role: 'USER' });

  it('deve exigir autenticação', async () => {
    const response = await request(app).get('/api/v1/cart');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET / deve retornar carrinho do usuário autenticado', async () => {
    cartService.getCart.mockResolvedValueOnce({
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      couponCode: null
    });

    const response = await request(app)
      .get('/api/v1/cart')
      .set(authHeader(token));

    expect(response.status).toBe(200);
    expect(response.body.data.items).toEqual([]);
    expect(cartService.getCart).toHaveBeenCalledWith('user-1');
  });

  it('POST /items deve adicionar item', async () => {
    cartService.addItem.mockResolvedValueOnce({
      items: [{ productId: 'p1', quantity: 1, price: 50, name: 'Produto' }],
      subtotal: 50,
      discount: 0,
      total: 50,
      couponCode: null
    });

    const response = await request(app)
      .post('/api/v1/cart/items')
      .set(authHeader(token))
      .send({ productId: 'p1', quantity: 1 });

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(cartService.addItem).toHaveBeenCalledWith('user-1', {
      productId: 'p1',
      quantity: 1
    });
  });

  it('POST /items deve propagar erro de estoque', async () => {
    cartService.addItem.mockRejectedValueOnce(
      new AppError('Estoque insuficiente', 409, 'OUT_OF_STOCK')
    );

    const response = await request(app)
      .post('/api/v1/cart/items')
      .set(authHeader(token))
      .send({ productId: 'p1', quantity: 99 });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('OUT_OF_STOCK');
  });

  it('DELETE /items/:itemId deve remover item', async () => {
    cartService.removeItem.mockResolvedValueOnce({
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      couponCode: null
    });

    const response = await request(app)
      .delete('/api/v1/cart/items/p1')
      .set(authHeader(token));

    expect(response.status).toBe(200);
    expect(cartService.removeItem).toHaveBeenCalledWith('user-1', 'p1');
  });
});
