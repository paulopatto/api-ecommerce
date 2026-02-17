# Autenticação - Documentação Funcional

## 1. Visão Geral
O módulo de Autenticação gerencia o acesso seguro à API, utilizando o padrão JWT (JSON Web Token) com estratégia de Access Token e Refresh Token.

## 2. Regras de Negócio

### Ciclo de Vida do Token
*   **Access Token**: 
    *   Validade curta (Default: 15 minutos).
    *   Assinado com `JWT_ACCESS_SECRET`.
    *   Contém claims de identificação (`sub`) e autorização (`role`).
*   **Refresh Token**: 
    *   Validade longa (Default: 7 dias).
    *   Assinado com `JWT_REFRESH_SECRET`.
    *   Armazenado no **Redis** (`refresh:{userId}`) para permitir gerenciamento de sessão (logout/revogação).

### Segurança
*   Senhas são armazenadas utilizando hash **Bcrypt**.
*   Login retorna erro genérico ("Credenciais inválidas") para evitar enumeração de usuários.

## 3. Endpoints da API (`/api/v1/auth`)

### Registro
`POST /register`
*   **Descrição**: Cria um novo usuário no sistema.
*   **Payload**:
    ```json
    {
      "name": "Nome Usuário",
      "email": "email@exemplo.com",
      "password": "senhaForte123"
    }
    ```
*   **Comportamento**: Cria o usuário com role `USER` e já retorna os tokens de acesso (login automático).

### Login
`POST /login`
*   **Descrição**: Autentica um usuário existente.
*   **Payload**: `email`, `password`.
*   **Retorno**:
    ```json
    {
      "user": { ... },
      "tokens": {
        "accessToken": "ey...",
        "refreshToken": "ey..."
      }
    }
    ```
