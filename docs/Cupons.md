# Sistema de Cupons - Documentação Funcional

## 1. Visão Geral
O sistema de cupons permite que administradores criem códigos promocionais que aplicam descontos no valor total dos pedidos. Os descontos podem ser fixos (valor monetário) ou percentuais. O sistema gerencia todo o ciclo de vida do cupom, desde a criação, aplicação no carrinho, validação e uso final no checkout.

## 2. Modelo de Dados

### Entidade `Coupon`
Representa um código promocional.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único. |
| `code` | String | O código promocional (ex: `DESCONTO10`). Deve ser único. |
| `type` | Enum | Tipo de desconto: `PERCENTAGE` ou `FIXED`. |
| `value` | Decimal | O valor do desconto. Se `PERCENTAGE`, é %, se `FIXED`, é valor monetário. |
| `minPurchase` | Decimal? | Valor mínimo do carrinho (subtotal) para validar o cupom. |
| `expirationDate` | DateTime | Data limite para uso. |
| `usageLimit` | Int? | Limite global de quantas vezes o cupom pode ser usado por todos os usuários. |
| `usageCount` | Int | Contador atual de usos. |
| `active` | Boolean | Status do cupom (Ativo/Inativo). |

### Impacto no `Order`
O pedido armazena os detalhes do desconto aplicado para fins históricos.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `subtotal` | Decimal | Valor da soma dos itens antes do desconto. |
| `discount` | Decimal | Valor total descontado. |
| `totalValue` | Decimal | Valor final pago (`subtotal - discount`). |
| `couponId` | FK | Referência ao cupom utilizado. |

## 3. Regras de Negócio e Validação

### Validação do Cupom
Para um cupom ser aceito, ele deve passar por todas as checagens abaixo no momento da aplicação e no momento do checkout:
1.  **Existência**: O código deve existir no banco.
2.  **Status**: Deve estar `active = true`.
3.  **Validade**: A data atual deve ser anterior à `expirationDate`.
4.  **Limite de Uso**: `usageCount` deve ser menor que `usageLimit` (se configurado).
5.  **Valor Mínimo**: O subtotal do carrinho deve ser maior ou igual a `minPurchase` (se configurado).

### Cálculo do Desconto
*   **PERCENTAGE**: `Desconto = Subtotal * (Value / 100)`
*   **FIXED**: `Desconto = Value`
*   **Limite de Segurança**: O desconto nunca pode exceder o valor total do carrinho. Se `Desconto > Subtotal`, então `Desconto = Subtotal`.

### Checkout Transacional
O uso do cupom no checkout é atômico.
*   Ao confirmar o pedido, o sistema incrementa `usageCount` do cupom.
*   Se ocorrer qualquer erro durante o checkout (ex: falta de estoque), o incremento é revertido (rollback).

## 4. Integração com Carrinho (Redis)
O carrinho de compras (`cart:{userId}`) armazena o estado do cupom aplicado.

*   Quando um cupom é aplicado com sucesso, o carrinho guarda:
    *   `couponCode`: O código do cupom.
    *   `discount`: O valor calculado do desconto.
    *   `subtotal` e `total` atualizados.
*   **Recálculo Automático**: Toda vez que itens são adicionados ou removidos do carrinho, o sistema tenta reaplicar o cupom salvo.
    *   Se as regras ainda forem atendidas (ex: valor mínimo), o desconto é recalculado.
    *   Se as regras não forem mais atendidas (ex: removeu itens e o valor caiu abaixo do mínimo), o cupom é removido automaticamente e uma mensagem é retornada.

## 5. Endpoints da API

### Administração

#### Criar Cupom
`POST /api/v1/coupons`
*   **Auth**: Apenas ADMIN.
*   **Payload**:
    ```json
    {
      "code": "NATAL2025",
      "type": "PERCENTAGE",
      "value": 10,
      "expirationDate": "2025-12-25T23:59:59Z",
      "minPurchase": 100,
      "usageLimit": 1000
    }
    ```

#### Listar Cupons
`GET /api/v1/coupons`
*   **Auth**: Apenas ADMIN.

### Loja (Cliente)

#### Aplicar Cupom no Carrinho
`POST /api/v1/cart/coupon`
*   **Payload**: `{ "code": "NATAL2025" }`
*   **Retorno**: Carrinho atualizado com valores de desconto.

#### Remover Cupom do Carrinho
`DELETE /api/v1/cart/coupon`
*   **Retorno**: Carrinho atualizado sem desconto.

### Pedidos

#### Checkout
`POST /api/v1/orders`
*   Processa automaticamente o cupom que estiver aplicado no carrinho do usuário.
*   Realiza validação final e persistência.
