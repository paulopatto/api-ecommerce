# API E-commerce Node.js

> Essa api foi baixada de https://github.com/alura-cursos/api_eccomerce e foi utilizada no curso
> n8n 4 devs: Automatizando e integrando AI ao fluxo de trabalho
> no módulo de automação de testes.
> Foi utilizado também um repositório de PROMPTS do repo https://github.com/alura-cursos/prompts_testes/

API RESTful modular construída com Node.js, Express, Prisma (PostgreSQL) e Redis.

## Pré-requisitos

- Node.js 20 (conforme `.nvmrc` — `20.20.0`)
- Docker e Docker Compose

## Configuração

1. **Instalar Dependências**

   ```bash
   npm install
   ```

2. **Configurar Ambiente**

   ```bash
   cp .env.example .env
   ```

   Ajuste secrets JWT e credenciais do banco conforme necessário.

3. **Iniciar Infraestrutura local (Banco e Redis)**

   ```bash
   docker compose up -d
   ```

4. **Rodar Migrations do Banco**

   ```bash
   npm run migrate
   ```

## Rodando a API

- Desenvolvimento:

  ```bash
  npm run dev
  ```

- Produção via Docker Compose:

  ```bash
  docker compose -f compose.prod.yaml --env-file .env up -d --build
  ```

## Testes

```bash
npm test                 # todos os testes
npm run test:unit        # testes unitários
npm run test:contract    # testes de contrato dos endpoints
```

## Estrutura

- **src/modules**: Contém a lógica de negócio dividida por domínio (Auth, Cart, Users, etc).
- **src/config**: Configurações de DB, Redis, Logger.
- **src/middlewares**: Middlewares globais (Erro, Auth, Logging).

---

## Login e uso dos principais endpoints (Postman)

Base URL local: `http://localhost:3000`

### 1. Healthcheck

| Método | URL | Auth |
|--------|-----|------|
| `GET` | `/health` | Não |

Resposta esperada: `{ "status": "UP", "timestamp": "..." }`

### 2. Registrar usuário

| Método | URL | Auth |
|--------|-----|------|
| `POST` | `/api/v1/auth/register` | Não |

Headers: `Content-Type: application/json`

Body:

```json
{
  "name": "Nome Usuário",
  "email": "email@exemplo.com",
  "password": "senhaForte123"
}
```

Resposta (`201`): `data.user` + `data.tokens.accessToken` / `data.tokens.refreshToken`.

### 3. Login

| Método | URL | Auth |
|--------|-----|------|
| `POST` | `/api/v1/auth/login` | Não |

Body:

```json
{
  "email": "email@exemplo.com",
  "password": "senhaForte123"
}
```

No Postman, salve o token em variável de ambiente:

1. Na aba **Tests** da request de login/register:

```javascript
const json = pm.response.json();
pm.environment.set("accessToken", json.data.tokens.accessToken);
```

2. Crie variável `accessToken` no Environment do Postman.
3. Nas requests protegidas, use header:

```
Authorization: Bearer {{accessToken}}
```

### 4. Categorias e produtos (leitura pública)

| Método | URL | Auth | Descrição |
|--------|-----|------|-----------|
| `GET` | `/api/v1/categories` | Não | Lista categorias |
| `GET` | `/api/v1/categories/:id` | Não | Detalhe da categoria |
| `GET` | `/api/v1/products` | Não | Lista produtos (`?page=1&limit=20&search=&categoryId=`) |
| `GET` | `/api/v1/products/:id` | Não | Detalhe do produto |

### 5. Admin — criar categoria / produto

Requer usuário com `role: ADMIN` no JWT.

| Método | URL | Body exemplo |
|--------|-----|--------------|
| `POST` | `/api/v1/categories` | `{ "name": "Roupas", "parentId": null }` |
| `POST` | `/api/v1/products` | `{ "name": "Camiseta", "description": "Algodão", "sku": "SKU-001", "price": 79.9, "stock": 50, "categoryId": "<uuid>" }` |

### 6. Carrinho (auth obrigatória)

| Método | URL | Body |
|--------|-----|------|
| `GET` | `/api/v1/cart` | — |
| `POST` | `/api/v1/cart/items` | `{ "productId": "<uuid>", "quantity": 1 }` |
| `DELETE` | `/api/v1/cart/items/:itemId` | — (`itemId` = `productId`) |

### 7. Pedidos (auth obrigatória)

| Método | URL | Descrição |
|--------|-----|-----------|
| `GET` | `/api/v1/orders` | Lista pedidos do usuário |
| `POST` | `/api/v1/orders` | Checkout (usa o carrinho atual; sem body de itens) |

### 8. Pagamentos (auth obrigatória)

| Método | URL | Headers / Body |
|--------|-----|----------------|
| `POST` | `/api/v1/payments` | Body: `{ "orderId": "<uuid>" }` |
| `POST` | `/api/v1/payments/:id/confirm` | Header obrigatório: `Idempotency-Key: <string-unica>` |
| `POST` | `/api/v1/payments/:id/cancel` | — |

### 9. Usuário (auth obrigatória)

| Método | URL | Descrição |
|--------|-----|-----------|
| `GET` | `/api/v1/users/:id` | Perfil (próprio usuário ou admin) |
| `PUT` | `/api/v1/users/:id` | Atualizar dados |
| `DELETE` | `/api/v1/users/:id` | Remover usuário |

### Coleção sugerida no Postman

Ordem recomendada para cadastro da collection:

1. `Auth / Register`
2. `Auth / Login` (grava `accessToken`)
3. `Categories / List` → `Products / List`
4. `Cart / Add Item` → `Cart / Get`
5. `Orders / Checkout` → `Orders / List`
6. `Payments / Create` → `Payments / Confirm`

---

## Deploy no Coolify

O projeto inclui `Dockerfile` (Node `20.20.0`) e `compose.prod.yaml` prontos para produção.

### Opção A — Docker Compose (recomendado)

1. No Coolify, crie um novo recurso **Docker Compose**.
2. Conecte o repositório Git e selecione a branch desejada (ex.: `wso2`).
3. Informe o arquivo de compose: `compose.prod.yaml`.
4. Configure as variáveis de ambiente (ou use um `.env` no Coolify):

   | Variável | Exemplo / observação |
   |----------|----------------------|
   | `DB_USER` | `admin` |
   | `DB_PASSWORD` | senha forte |
   | `DB_NAME` | `api_ecommerce` |
   | `JWT_ACCESS_SECRET` | string longa e aleatória |
   | `JWT_REFRESH_SECRET` | string longa e aleatória |
   | `JWT_ACCESS_EXPIRATION` | `15m` |
   | `JWT_REFRESH_EXPIRATION` | `7d` |
   | `PORT` | `3000` (ou a porta exposta no Coolify) |

5. Faça o deploy. O entrypoint da API executa `prisma migrate deploy` antes de subir o servidor.
6. Healthcheck: `GET /health` (já configurado no compose e no Dockerfile).
7. Aponte o domínio público do Coolify para o serviço `api` na porta `3000`.

### Opção B — Dockerfile (somente a API)

Use quando Postgres e Redis já existirem como serviços gerenciados no Coolify:

1. Crie um recurso **Dockerfile**.
2. Dockerfile path: `Dockerfile`.
3. Defina as envs:

   - `DATABASE_URL=postgresql://USER:PASS@HOST:5432/DB?schema=public`
   - `REDIS_HOST` / `REDIS_PORT`
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
   - `JWT_ACCESS_EXPIRATION` / `JWT_REFRESH_EXPIRATION`
   - `PORT=3000`
   - `NODE_ENV=production`

4. Healthcheck path: `/health`
5. Deploy e valide com `GET https://seu-dominio/health`

### Observações de produção

- Não exponha Postgres/Redis publicamente; no `compose.prod.yaml` eles ficam só na rede interna.
- Troque todos os secrets default antes de ir a produção.
- Após o primeiro deploy, use `POST /api/v1/auth/register` (ou seed) para criar o primeiro usuário; usuários admin precisam de `role: ADMIN` no banco.
