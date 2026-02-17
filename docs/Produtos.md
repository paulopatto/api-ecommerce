# Produtos - Documentação Funcional

## 1. Visão Geral
Responsável pelo cadastro, estoque e exibição dos produtos à venda. Focado em alta performance de leitura.

## 2. Modelo de Dados (`Product`)
*   `sku`: Código de estoque único.
*   `price`: Preço atual de venda.
*   `stock`: Quantidade física disponível.
*   `status`: `ACTIVE` (visível/comprável) ou `INACTIVE`.
*   `categoryId`: Associação com categoria.

## 3. Regras de Negócio
*   **Cache**: Listagens de produtos são cacheadas no Redis por 60 segundos para reduzir load no banco.
*   **Estoque**: validação rigorosa de unicidade de SKU.
*   **Busca**: Suporte a filtro por texto (nome/descrição) e categoria.

## 4. Endpoints da API (`/api/v1/products`)

### Publicos
*   `GET /`: Listagem paginada com filtros.
*   `GET /{id}`: Detalhes de um produto.

### Administrativos (Secure)
*   `POST /`: Cadastro de produto.
*   `PUT /{id}`: Atualização de dados ou ajuste manual de estoque.
*   `DELETE /{id}`: Remoção lógica ou física do produto.
