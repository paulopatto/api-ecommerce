const request = require('supertest');

jest.mock('../../src/modules/products/productService');

const app = require('../../src/server');
const productService = require('../../src/modules/products/productService');
const AppError = require('../../src/utils/AppError');
const { createAccessToken, authHeader } = require('../helpers/auth');

describe('Products endpoints (/api/v1/products)', () => {
  describe('GET /', () => {
    it('deve listar produtos com paginação', async () => {
      productService.listProducts.mockResolvedValueOnce({
        data: [{ id: 'p1', name: 'Camiseta', sku: 'SKU-1', price: '49.90' }],
        pagination: { page: 1, limit: 20, totalItems: 1, totalPages: 1 }
      });

      const response = await request(app).get('/api/v1/products');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toEqual(
        expect.objectContaining({ page: 1, totalItems: 1 })
      );
    });
  });

  describe('GET /:id', () => {
    it('deve retornar produto por id', async () => {
      productService.getProductById.mockResolvedValueOnce({
        id: 'p1',
        name: 'Camiseta',
        sku: 'SKU-1'
      });

      const response = await request(app).get('/api/v1/products/p1');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('p1');
    });

    it('deve retornar 404 quando produto não existe', async () => {
      productService.getProductById.mockRejectedValueOnce(
        new AppError('Produto não encontrado', 404, 'RESOURCE_NOT_FOUND')
      );

      const response = await request(app).get('/api/v1/products/missing');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('POST / (admin)', () => {
    it('deve exigir autenticação', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Novo' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('deve negar acesso para role USER', async () => {
      const token = createAccessToken({ role: 'USER' });

      const response = await request(app)
        .post('/api/v1/products')
        .set(authHeader(token))
        .send({ name: 'Novo', sku: 'SKU-2', price: 10, categoryId: 'c1', description: 'desc' });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('deve criar produto quando admin', async () => {
      const token = createAccessToken({ role: 'ADMIN' });
      const created = {
        id: 'p2',
        name: 'Boné',
        sku: 'SKU-2',
        price: '29.90',
        categoryId: 'c1'
      };
      productService.createProduct.mockResolvedValueOnce(created);

      const response = await request(app)
        .post('/api/v1/products')
        .set(authHeader(token))
        .send({
          name: 'Boné',
          sku: 'SKU-2',
          price: 29.9,
          categoryId: 'c1',
          description: 'Boné preto'
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(created);
    });
  });

  describe('PUT /:id e DELETE /:id (admin)', () => {
    it('deve atualizar produto', async () => {
      const token = createAccessToken({ role: 'ADMIN' });
      productService.updateProduct.mockResolvedValueOnce({ id: 'p1', name: 'Atualizado' });

      const response = await request(app)
        .put('/api/v1/products/p1')
        .set(authHeader(token))
        .send({ name: 'Atualizado' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Atualizado');
    });

    it('deve remover produto com 204', async () => {
      const token = createAccessToken({ role: 'ADMIN' });
      productService.deleteProduct.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .delete('/api/v1/products/p1')
        .set(authHeader(token));

      expect(response.status).toBe(204);
    });
  });
});
