# Carrinho de Compras - Documentação Funcional

## 1. Visão Geral
O carrinho de compras é um módulo de alta performance gerenciado exclusivamente no Redis. Ele não mantém estado persistente no banco de dados relacional até o momento do checkout. Isso garante velocidade extrema na manipulação de itens e cálculo de valores.

## 2. Estrutura de Dados (Redis)
O carrinho é armazenado como um JSON stringificado na chave `cart:{tenantId}:{userId}`.

**JSON Schema**:
```json
{
  "items": [
    {
      "productId": "UUID",
      "name": "Produto Exemplo",
      "price": 100.00,
      "quantity": 2
    }
  ],
  "subtotal": 200.00,
  "discount": 0.00,
  "couponCode": null,
  "total": 200.00
}
```

## 3. Regras de Negócio

### Gestão de Itens
*   **Adicionar**: 
    *   Verifica se o produto existe e está ativo no banco.
    *   Verifica se há estoque suficiente para a quantidade solicitada.
    *   Se o item já existe no carrinho, incrementa a quantidade (revalidando estoque total).
*   **Remover**: Remove o item do array e recalcula totais.

### Persistência e Sessão
*   **TTL**: O carrinho expira automaticamente após 30 dias de inatividade (`EX: 2592000`).
*   **Limpeza**: O carrinho é apagado automaticamente após um checkout bem-sucedido.

### Integração com Cupons
*   O carrinho suporta a aplicação de cupons via endpoint específico.
*   **Recálculo Automático**: Toda operação de adicionar/remover itens dispara um recálculo:
    1.  Soma `subtotal`.
    2.  Se houver `couponCode`, revalida as regras do cupom.
    3.  Atualiza `discount` e `total`.
    4.  Se o cupom se tornar inválido (ex: subtotal caiu abaixo do mínimo), o cupom é removido automaticamente.

## 4. Endpoints da API

### Carrinho (`/api/v1/cart`)

#### Ver Carrinho
`GET /`
*   Retorna estado atual do carrinho.

#### Adicionar Item
`POST /items`
*   Payload: `{ "productId": "uuid", "quantity": 1 }`
*   Valida estoque em tempo real.

#### Remover Item
`DELETE /items/{itemId}`
*   Remove produto específico.

#### Aplicar Cupom
`POST /coupon`
*   Payload: `{ "code": "DESC10" }`
*   Aplica desconto se válido.

#### Remover Cupom
`DELETE /coupon`
*   Remove desconto aplicado.
