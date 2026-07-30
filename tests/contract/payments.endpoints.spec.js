const request = require('supertest');

jest.mock('../../src/modules/payments/paymentService');

const app = require('../../src/server');
const paymentService = require('../../src/modules/payments/paymentService');
const AppError = require('../../src/utils/AppError');
const { createAccessToken, authHeader } = require('../helpers/auth');

describe('Payments endpoints (/api/v1/payments)', () => {
  const token = createAccessToken({ userId: 'user-1', role: 'USER' });

  it('deve exigir autenticação', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({ orderId: 'o1' });

    expect(response.status).toBe(401);
  });

  it('POST / deve criar intenção de pagamento', async () => {
    paymentService.createPaymentIntent.mockResolvedValueOnce({
      id: 'pay-1',
      orderId: 'o1',
      status: 'AWAITING_CONFIRMATION'
    });

    const response = await request(app)
      .post('/api/v1/payments')
      .set(authHeader(token))
      .send({ orderId: 'o1' });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('AWAITING_CONFIRMATION');
  });

  it('POST /:id/confirm deve exigir Idempotency-Key', async () => {
    paymentService.confirmPayment.mockRejectedValueOnce(
      new AppError('Header Idempotency-Key obrigatório', 400, 'INVALID_PAYLOAD')
    );

    const response = await request(app)
      .post('/api/v1/payments/pay-1/confirm')
      .set(authHeader(token));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_PAYLOAD');
  });

  it('POST /:id/confirm deve confirmar pagamento', async () => {
    paymentService.confirmPayment.mockResolvedValueOnce({
      id: 'pay-1',
      status: 'PAID'
    });

    const response = await request(app)
      .post('/api/v1/payments/pay-1/confirm')
      .set(authHeader(token))
      .set('Idempotency-Key', 'idem-123');

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('PAID');
    expect(paymentService.confirmPayment).toHaveBeenCalledWith('pay-1', 'idem-123');
  });

  it('POST /:id/cancel deve cancelar pagamento', async () => {
    paymentService.cancelPayment.mockResolvedValueOnce({
      message: 'Pagamento e Pedido cancelados'
    });

    const response = await request(app)
      .post('/api/v1/payments/pay-1/cancel')
      .set(authHeader(token));

    expect(response.status).toBe(200);
    expect(response.body.data.message).toContain('cancelados');
  });
});
