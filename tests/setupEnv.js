process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-for-jest-suite';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-jest-suite';
process.env.JWT_ACCESS_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?schema=public';
