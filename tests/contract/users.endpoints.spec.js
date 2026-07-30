const request = require('supertest');

jest.mock('../../src/modules/users/userService');

const app = require('../../src/server');
const userService = require('../../src/modules/users/userService');
const AppError = require('../../src/utils/AppError');
const { createAccessToken, authHeader } = require('../helpers/auth');

describe('Users endpoints (/api/v1/users)', () => {
  it('deve exigir autenticação', async () => {
    const response = await request(app).get('/api/v1/users/user-1');
    expect(response.status).toBe(401);
  });

  it('GET /:id deve retornar perfil do próprio usuário', async () => {
    const token = createAccessToken({ userId: 'user-1', role: 'USER' });
    userService.getProfile.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@exemplo.com',
      role: 'USER'
    });

    const response = await request(app)
      .get('/api/v1/users/user-1')
      .set(authHeader(token));

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe('ana@exemplo.com');
  });

  it('GET /:id deve negar acesso a outro usuário', async () => {
    const token = createAccessToken({ userId: 'user-1', role: 'USER' });

    const response = await request(app)
      .get('/api/v1/users/user-2')
      .set(authHeader(token));

    expect(response.status).toBe(403);
  });

  it('PUT /:id deve atualizar usuário', async () => {
    const token = createAccessToken({ userId: 'user-1', role: 'USER' });
    userService.updateUser.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Ana Atualizada',
      email: 'ana@exemplo.com',
      role: 'USER'
    });

    const response = await request(app)
      .put('/api/v1/users/user-1')
      .set(authHeader(token))
      .send({ name: 'Ana Atualizada' });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Ana Atualizada');
  });

  it('DELETE /:id deve remover usuário com 204', async () => {
    const token = createAccessToken({ userId: 'user-1', role: 'USER' });
    userService.deleteUser.mockResolvedValueOnce({ message: 'Usuário removido com sucesso' });

    const response = await request(app)
      .delete('/api/v1/users/user-1')
      .set(authHeader(token));

    expect(response.status).toBe(204);
  });

  it('GET /:id deve retornar 404 quando usuário não existe', async () => {
    const token = createAccessToken({ userId: 'user-1', role: 'USER' });
    userService.getProfile.mockRejectedValueOnce(
      new AppError('Usuário não encontrado', 404, 'RESOURCE_NOT_FOUND')
    );

    const response = await request(app)
      .get('/api/v1/users/user-1')
      .set(authHeader(token));

    expect(response.status).toBe(404);
  });
});
