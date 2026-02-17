# Pagamentos - Documentação Funcional

## 1. Visão Geral
Módulo responsável por gerenciar o ciclo de pagamento dos pedidos. Atua como ponte entre o sistema interno e gateways de pagamento externos.

## 2. Regras de Negócio
*   **Idempotência**: Requisições de confirmação de pagamento (`confirm`) devem fornecer header `Idempotency-Key` para evitar processamento duplicado, comum em webhooks.
*   **Atomicidade**: A confirmação de pagamento atualiza simultaneamente o status do `Payment` e do `Order` vinculado para `PAID`.

## 3. Endpoints da API (`/api/v1/payments`)

### Criar Intenção (Interno)
`POST /`
*   Geralmente chamado automaticamente pelo Checkout, mas exposto para gateways manuais.

### Confirmar Pagamento
`POST /{id}/confirm`
*   Simula o webhook de sucesso do gateway.
*   Transaciona o pedido para o estado `PAID` definitiva.

### Cancelar Pagamento
`POST /{id}/cancel`
*   Simula webhook de falha ou cancelamento.
*   Transaciona pedido para `CANCELED`.
