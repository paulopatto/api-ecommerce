# Categorias - Documentação Funcional

## 1. Visão Geral
Gerencia a árvore de categorização dos produtos.

## 2. Modelo de Dados (`Category`)
*   `name`: Nome da categoria.
*   `parentId`: Referência opcional a uma categoria pai.

## 3. Regras de Negócio
*   **Hierarquia**: Categorias podem ter infinitos níveis de profundidade (Pai -> Filho -> Neto).
*   **Integridade**: Não é permitido excluir uma categoria que tenha produtos ou subcategorias vinculadas (Proteção FK).

## 4. Endpoints da API (`/api/v1/categories`)

### Publicos
*   `GET /`: Lista todas as categorias com suas subcategorias aninhadas (`include children`).

### Administrativos
*   `POST /`: Criar nova categoria.
*   `PUT /{id}`: Editar nome ou mover de pai.
*   `DELETE /{id}`: Remover categoria.
