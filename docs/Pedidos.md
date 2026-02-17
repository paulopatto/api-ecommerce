# Pedidos - Documentação Funcional

## 1. Visão Geral
Gerencia o ciclo de vida das compras dos usuários, desde a criação (checkout) até a conclusão (pagamento confirmado).

## 2. Modelo de Dados (`Order`)
*   `userId`: Cliente.
*   `items`: Lista de itens comprados snapshot (preço congelado no momento da compra).
*   `subtotal`: Soma dos produtos.
*   `discount`: Valor abatido (cupom).
*   `totalValue`: Valor final a pagar.
*   `status`: `PENDING` -> `PAID` | `CANCELED`.
*   `couponId`: Referência ao cupom usado (histórico).

## 3. Regras de Negócio
*   **Checkout Atômico**: A criação do pedido ocorre em uma transação de banco de dados que garante:
    1.  Validação de estoque final.
    2.  Decremento de estoque.
    3.  Criação do pedido.
    4.  Consumo do cupom.
    5.  Criação da intenção de pagamento.
*   **Snapshot de Preço**: O sistema não confia nos preços vindos do frontend ou carrinho. Ele busca o preço atual no banco no momento exato do checkout.

## 4. Endpoints da API (`/api/v1/orders`)

### Listar Meus Pedidos
`GET /`
*   Retorna histórico de pedidos do usuário logado.

### Checkout (Criar Pedido)
`POST /`
*   Não recebe payload de itens.
*   Utiliza automaticamente o conteúdo do **Carrinho (Redis)** do usuário logado.
*   Após sucesso, o carrinho é esvaziado.
