jest.mock('../src/config/redis', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  isOpen: true,
  connect: jest.fn().mockResolvedValue(undefined),
  on: jest.fn()
}));

jest.mock('../src/config/database', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  product: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  category: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn()
  },
  payment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  $transaction: jest.fn()
}));

jest.mock('../src/config/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  http: jest.fn(),
  debug: jest.fn()
}));
