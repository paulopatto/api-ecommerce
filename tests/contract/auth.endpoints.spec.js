const request = require('supertest');

jest.mock('../../src/modules/auth/authService');

const app = require('../../src/server');
const authService = require('../../src/modules/auth/authService');
const AppError = require('../../src/utils/AppError');

describe('Auth endpoints (/api/v1/auth)', () => {
  describe('POST /register', () => {
    it('deve registrar usuário e retornar 201 com tokens', async () => {
      const payload = {
        name: 'Ana Silva',
        email: 'ana@exemplo.com',
        password: 'senhaForte123'
      };

      authService.register.mockResolvedValueOnce({
        user: { id: 'u1', name: payload.name, email: payload.email, role: 'USER' },
        tokens: { accessToken: 'access.jwt', refreshToken: 'refresh.jwt' }
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          data: {
            user: expect.objectContaining({
              id: 'u1',
              email: payload.email,
              role: 'USER'
            }),
            tokens: {
              accessToken: expect.any(String),
              refreshToken: expect.any(String)
            }
          },
          meta: expect.objectContaining({
            timestamp: expect.any(String)
          })
        })
      );
      expect(authService.register).toHaveBeenCalledWith(payload);
    });

    it('deve retornar 400 quando payload é inválido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: '', email: 'invalido', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toEqual(
        expect.objectContaining({
          code: 'INVALID_PAYLOAD',
          message: 'Dados inválidos'
        })
      );
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('deve retornar 409 quando email já existe', async () => {
      authService.register.mockRejectedValueOnce(
        new AppError('Email já está em uso', 409, 'CONFLICT')
      );

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Ana',
          email: 'ana@exemplo.com',
          password: 'senhaForte123'
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  describe('POST /login', () => {
    it('deve autenticar e retornar 200 com tokens', async () => {
      authService.login.mockResolvedValueOnce({
        user: { id: 'u1', name: 'Ana', email: 'ana@exemplo.com', role: 'USER' },
        tokens: { accessToken: 'access.jwt', refreshToken: 'refresh.jwt' }
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'ana@exemplo.com', password: 'senhaForte123' });

      expect(response.status).toBe(200);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(authService.login).toHaveBeenCalledWith('ana@exemplo.com', 'senhaForte123');
    });

    it('deve retornar 401 com credenciais inválidas', async () => {
      authService.login.mockRejectedValueOnce(
        new AppError('Credenciais inválidas', 401, 'UNAUTHORIZED')
      );

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'ana@exemplo.com', password: 'errada' });

      expect(response.status).toBe(401);
      expect(response.body.error).toEqual(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
          message: 'Credenciais inválidas'
        })
      );
    });

    it('deve retornar 400 quando email é inválido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nao-email', password: 'senha' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_PAYLOAD');
    });
  });
});
