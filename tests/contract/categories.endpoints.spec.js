const request = require('supertest');

jest.mock('../../src/modules/categories/categoryService');

const app = require('../../src/server');
const categoryService = require('../../src/modules/categories/categoryService');
const AppError = require('../../src/utils/AppError');
const { createAccessToken, authHeader } = require('../helpers/auth');

describe('Categories endpoints (/api/v1/categories)', () => {
  it('GET / deve listar categorias', async () => {
    categoryService.listCategories.mockResolvedValueOnce([
      { id: 'c1', name: 'Roupas', children: [] }
    ]);

    const response = await request(app).get('/api/v1/categories');

    expect(response.status).toBe(200);
    expect(response.body.data[0].name).toBe('Roupas');
  });

  it('GET /:id deve retornar categoria', async () => {
    categoryService.getCategoryById.mockResolvedValueOnce({ id: 'c1', name: 'Roupas' });

    const response = await request(app).get('/api/v1/categories/c1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('c1');
  });

  it('GET /:id deve retornar 404 quando não encontrada', async () => {
    categoryService.getCategoryById.mockRejectedValueOnce(
      new AppError('Categoria não encontrada', 404, 'RESOURCE_NOT_FOUND')
    );

    const response = await request(app).get('/api/v1/categories/missing');

    expect(response.status).toBe(404);
  });

  it('POST / deve criar categoria como admin', async () => {
    const token = createAccessToken({ role: 'ADMIN' });
    categoryService.createCategory.mockResolvedValueOnce({ id: 'c2', name: 'Acessórios' });

    const response = await request(app)
      .post('/api/v1/categories')
      .set(authHeader(token))
      .send({ name: 'Acessórios' });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Acessórios');
  });

  it('POST / deve negar usuário comum', async () => {
    const token = createAccessToken({ role: 'USER' });

    const response = await request(app)
      .post('/api/v1/categories')
      .set(authHeader(token))
      .send({ name: 'Acessórios' });

    expect(response.status).toBe(403);
  });

  it('PUT /:id e DELETE /:id devem funcionar para admin', async () => {
    const token = createAccessToken({ role: 'ADMIN' });
    categoryService.updateCategory.mockResolvedValueOnce({ id: 'c1', name: 'Moda' });
    categoryService.deleteCategory.mockResolvedValueOnce(undefined);

    const updateResponse = await request(app)
      .put('/api/v1/categories/c1')
      .set(authHeader(token))
      .send({ name: 'Moda' });

    const deleteResponse = await request(app)
      .delete('/api/v1/categories/c1')
      .set(authHeader(token));

    expect(updateResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(204);
  });
});
